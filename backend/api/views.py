import json
import os
import math
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.shortcuts import get_object_or_404
from .models import Profile, FoodLog, WaterLog, WeightLog, ExerciseLog, SleepLog
from .serializers import ProfileSerializer, FoodLogSerializer, WaterLogSerializer, WeightLogSerializer, ExerciseLogSerializer, SleepLogSerializer
from django.conf import settings
from django.db.models import Sum, StdDev
from datetime import date, timedelta
from google import genai

from rest_framework import permissions

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

class UpdateProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            profile = user.profile
            return Response(ProfileSerializer(profile).data)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        data = request.data
        user = request.user
        
        profile = Profile.objects.filter(user=user).first()
        
        if profile:
            serializer = ProfileSerializer(profile, data=data, partial=True)
        else:
            serializer = ProfileSerializer(data=data)

        if serializer.is_valid():
            # Save logic
            instance = serializer.save(user=user)
            
            # Calculate BMR & TDEE
            # Mifflin-St Jeor Equation
            weight = instance.weight_kg
            height = instance.height_cm
            age = instance.age
            gender = instance.gender
            activity_multiplier = float(instance.activity_level)
            
            if gender == 'Male':
                bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
            else:
                bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161
                
            tdee = bmr * activity_multiplier
            
            # Adjust for goal
            if instance.goal == 'Lose':
                target = tdee - 500
            elif instance.goal == 'Gain':
                target = tdee + 500
            else:
                target = tdee
                
            instance.tdee = round(tdee, 2)
            instance.daily_calorie_target = round(target, 2)
            instance.save()
            
            return Response(ProfileSerializer(instance).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SearchFoodView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        query = request.data.get('query')
        if not query:
            return Response({"error": "Query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        Identify the food '{query}' and return a JSON object with keys: 
        food_name, estimated_calories (integer), protein_g (float), carbs_g (float), fats_g (float). 
        Return ONLY JSON. Do not use Markdown code blocks.
        """
        
        try:
            response = model.generate_content(prompt)
            # Clean response if it contains markdown code blocks
            text = response.text.replace('```json', '').replace('```', '').strip()
            data = json.loads(text)
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LogFoodView(generics.ListCreateAPIView):
    serializer_class = FoodLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return FoodLog.objects.filter(user=user, date_eaten=date.today()).order_by('-id')
        
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            profile = user.profile
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
            
        logs = FoodLog.objects.filter(user=user, date_eaten=date.today())
        
        total_calories = logs.aggregate(Sum('calories'))['calories__sum'] or 0
        total_protein = logs.aggregate(Sum('protein'))['protein__sum'] or 0
        total_carbs = logs.aggregate(Sum('carbs'))['carbs__sum'] or 0
        total_fats = logs.aggregate(Sum('fats'))['fats__sum'] or 0
        
        return Response({
            "target_calories": profile.daily_calorie_target,
            "consumed_calories": total_calories,
            "macros": {
                "protein": total_protein,
                "carbs": total_carbs,
                "fats": total_fats
            },
            "remaining_calories": profile.daily_calorie_target - total_calories,
            "recent_logs": FoodLogSerializer(logs, many=True).data
        })

class WeeklyStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()
        
        # 1. Calculate Stats for Last 7 Days
        stats = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_logs = FoodLog.objects.filter(user=user, date_eaten=day)
            
            total_calories = day_logs.aggregate(Sum('calories'))['calories__sum'] or 0
            
            stats.append({
                "date": day.strftime("%Y-%m-%d"),
                "day_name": day.strftime("%a"),
                "calories": total_calories
            })
            
        # 2. Calculate Streak
        # Definition: Consecutive days ending yesterday (or today) where calories > 0
        # For simplicity, let's just count consecutive days with logged food going back from today.
        
        streak = 0
        check_date = today
        
        # Check today first? If they haven't logged today yet, streak shouldn't reset necessarily if they had a streak until yesterday.
        # Common logic: Streak is active if logged yesterday OR today.
        # Let's count backwards from today.
        
        # Optimization: Get all unique dates with logs for this user, ordered desc
        logged_dates = FoodLog.objects.filter(user=user).dates('date_eaten', 'day', order='DESC')
        
        # Convert to list of dates for easier handling
        logged_dates_list = list(logged_dates)
        
        if not logged_dates_list:
            streak = 0
        else:
            # Check if today or yesterday is the latest log
            latest_log = logged_dates_list[0]
            if latest_log < today - timedelta(days=1):
                streak = 0
            else:
                # Iterate and count consecutive
                current_check = latest_log
                streak = 1
                for i in range(1, len(logged_dates_list)):
                    prev_date = logged_dates_list[i]
                    if prev_date == current_check - timedelta(days=1):
                        streak += 1
                        current_check = prev_date
                    else:
                        break
        
        return Response({
            "daily_stats": stats,
            "streak": streak
        })

class WaterIntakeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()
        
        try:
            profile = user.profile
        except Profile.DoesNotExist:
             return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

        # Fixed recommendation: 7 glasses * 250ml = 1750ml
        water_goal = 1750 
        
        logs = WaterLog.objects.filter(user=user, date_eaten=today).order_by('-id')
        total_consumed = logs.aggregate(Sum('amount_ml'))['amount_ml__sum'] or 0
        
        # Weekly Chart Data
        weekly_chart_data = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_total = WaterLog.objects.filter(user=user, date_eaten=day).aggregate(Sum('amount_ml'))['amount_ml__sum'] or 0
            weekly_chart_data.append({
                "day_name": day.strftime("%a"),
                "date": day.strftime("%Y-%m-%d"),
                "amount_ml": day_total
            })

        return Response({
            "goal_ml": water_goal,
            "consumed_ml": total_consumed,
            "remaining_ml": max(0, water_goal - total_consumed),
            "logs": WaterLogSerializer(logs, many=True).data,
            "weekly_chart_data": weekly_chart_data
        })

    def post(self, request):
        serializer = WaterLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WeightTrackerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        logs = WeightLog.objects.filter(user=user).order_by('date')
        
        if not logs.exists():
             return Response({
                "logs": [],
                "current_weight": 0,
                "start_weight": 0,
                "change": 0,
                "plateau": False
            })

        current_weight = logs.last().weight_kg
        start_weight = logs.first().weight_kg
        change = round(current_weight - start_weight, 1)
        
        # Plateau Detection
        # Logic: If standard deviation of last 5 logs (if available) is very low (< 0.2kg)
        plateau = False
        recent_logs = logs.order_by('-date')[:5]
        if len(recent_logs) >= 3:
            weights = [log.weight_kg for log in recent_logs]
            # Calculate Standard Deviation
            mean = sum(weights) / len(weights)
            variance = sum([((x - mean) ** 2) for x in weights]) / len(weights)
            std_dev = variance ** 0.5
            
            if std_dev < 0.2:
                plateau = True

        return Response({
            "logs": WeightLogSerializer(logs, many=True).data,
            "current_weight": current_weight,
            "start_weight": start_weight,
            "change": change,
            "plateau": plateau
        })

    def post(self, request):
        serializer = WeightLogSerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save(user=request.user)
            
            # Sync with Profile
            try:
                profile = request.user.profile
                profile.weight_kg = instance.weight_kg
                # Maybe recalculate TDEE here? For now, let's just save.
                profile.save()
            except Profile.DoesNotExist:
                pass

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ExerciseLogView(generics.ListCreateAPIView):
    serializer_class = ExerciseLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()
        logs = ExerciseLog.objects.filter(user=user, date=today).order_by('-id')
        total_calories = logs.aggregate(Sum('calories_burned'))['calories_burned__sum'] or 0
        
        return Response({
            "logs": ExerciseLogSerializer(logs, many=True).data,
            "total_calories": total_calories
        })

    def post(self, request):
        data = request.data.copy()
        
        # AI Estimation Logic
        if not data.get('calories_burned'):
            try:
                profile = request.user.profile
                weight = profile.weight_kg
                duration = data.get('duration_minutes')
                ex_type = data.get('exercise_type')
                desc = data.get('description', '')
                
                model = genai.GenerativeModel('gemini-2.5-flash')
                prompt = f"""
                Estimate calories burned for a {weight}kg person doing {duration} min of {ex_type} ({desc}).
                Return ONLY an integer representing the estimated calories.
                """
                
                response = model.generate_content(prompt)
                estimated_calories = int(''.join(filter(str.isdigit, response.text)))
                data['calories_burned'] = estimated_calories
            except Exception as e:
                # Fallback or error
                print(f"AI Estimation failed: {e}")
                data['calories_burned'] = 0 # Or require user input
        
        serializer = ExerciseLogSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DietSuggestionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()
        
        try:
            profile = user.profile
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Calculate remaining calories/macros
        logs = FoodLog.objects.filter(user=user, date_eaten=today)
        total_calories = logs.aggregate(Sum('calories'))['calories__sum'] or 0
        total_protein = logs.aggregate(Sum('protein'))['protein__sum'] or 0
        total_carbs = logs.aggregate(Sum('carbs'))['carbs__sum'] or 0
        total_fats = logs.aggregate(Sum('fats'))['fats__sum'] or 0
        
        remaining_calories = max(0, profile.daily_calorie_target - total_calories)
        
        # Construct Prompt
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        The user has remaining calories: {remaining_calories} kcal for today.
        Current intake: {total_calories} kcal (Protein: {total_protein}g, Carbs: {total_carbs}g, Fats: {total_fats}g).
        
        Suggest 3 specific food items or simple meals that would be good options to eat next to help meet their daily nutrition goals. 
        Focus on healthy, nutrient-dense foods.
        
        Return a JSON array of objects with these keys:
        - food_name (string)
        - calories (integer)
        - protein (float)
        - carbs (float)
        - fats (float)
        - reason (short string explaining why this is a good choice)
        
        Example format:
        [
            {{"food_name": "Greek Yogurt with Berries", "calories": 150, "protein": 15, "carbs": 20, "fats": 0, "reason": "High protein snack"}}
        ]
        
        Return ONLY JSON. No markdown formatting.
        """
        
        try:
            response = model.generate_content(prompt)
            # Clean response if it contains markdown code blocks
            text = response.text.replace('```json', '').replace('```', '').strip()
            suggestions = json.loads(text)
            return Response(suggestions)
        except Exception as e:
            # print(f"Error generating suggestions: {e}")
            print(f"Error generating suggestions: {e}")
            return Response({"error": "Failed to generate suggestions. Please try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MonthlyStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()
        
        try:
            profile = user.profile
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Determine date range for the current month
        # Start: 1st of this month
        # End: Today
        start_date = today.replace(day=1)
        end_date = today
        
        # 1. Fetch Daily Logs (Calories & Macros)
        # We need a continuous list of days from start to end
        daily_stats = []
        
        total_days = (end_date - start_date).days + 1
        days_met_target = 0
        total_calories_logged_days = 0
        
        # Fetch all logs for the month in one query for efficiency
        food_logs = FoodLog.objects.filter(user=user, date_eaten__gte=start_date, date_eaten__lte=end_date)
        weight_logs = WeightLog.objects.filter(user=user, date__gte=start_date, date__lte=end_date)
        
        # Helper to filter logs in memory
        def get_day_food_logs(d):
            return [l for l in food_logs if l.date_eaten == d]
            
        def get_day_weight(d):
            # Find last weight log on or before this day? 
            # Or just weight log ON this day. Let's do ON this day for trend.
            # If no weight logged today, maybe carry over previous?
            # For charts, it's often better to have nulls or real data.
            # Let's find exact match first.
            matches = [l.weight_kg for l in weight_logs if l.date == d]
            return matches[-1] if matches else None

        current = start_date
        while current <= end_date:
            day_logs = get_day_food_logs(current)
            
            cals = sum(l.calories for l in day_logs)
            prot = sum(l.protein for l in day_logs)
            carbs = sum(l.carbs for l in day_logs)
            fats = sum(l.fats for l in day_logs)
            weight = get_day_weight(current)
            
            stat = {
                "date": current.strftime("%Y-%m-%d"),
                "day": current.day,
                "calories": cals,
                "protein": prot,
                "carbs": carbs,
                "fats": fats,
                "weight": weight,
                "target": profile.daily_calorie_target
            }
            daily_stats.append(stat)
            
            # Adherence Check
            # Assume target met if within +/- 10% range
            if cals > 0:
                lower = profile.daily_calorie_target * 0.9
                upper = profile.daily_calorie_target * 1.1
                if lower <= cals <= upper:
                    days_met_target += 1
                total_calories_logged_days += 1
            
            current += timedelta(days=1)

        # 2. Adherence Stats
        adherence_percentage = 0
        if total_calories_logged_days > 0:
            adherence_percentage = round((days_met_target / total_calories_logged_days) * 100, 1)

        # 3. Weight Change and Insights
        # Find first and last recorded weight in this month
        month_weights = [l.weight_kg for l in weight_logs]
        weight_change = 0
        start_weight = profile.weight_kg # Fallback
        end_weight = profile.weight_kg   # Fallback
        
        if month_weights:
            start_weight = month_weights[0]
            end_weight = month_weights[-1]
            if len(month_weights) >= 2:
                weight_change = round(end_weight - start_weight, 1)

        # Calculate BMI
        height_m = profile.height_cm / 100
        bmi = round(profile.weight_kg / (height_m * height_m), 1)
        
        bmi_category = "Normal"
        if bmi < 18.5: bmi_category = "Underweight"
        elif bmi >= 25 and bmi < 30: bmi_category = "Overweight"
        elif bmi >= 30: bmi_category = "Obese"
        
        # Insights Generation
        insights = []
        if adherence_percentage >= 80:
             insights.append("Great consistency! You are well on track.")
        elif adherence_percentage >= 50:
             insights.append("Good effort using the tracker. Aim for higher consistency.")
        else:
             insights.append("Try to log your meals more consistently to see better results.")
             
        if weight_change < 0 and profile.goal == 'Lose':
             insights.append(f"You've lost {abs(weight_change)}kg this month. Keep it up!")
        elif weight_change > 0 and profile.goal == 'Lose':
             insights.append("Weight has increased slightly. Check your calorie surplus.")

        return Response({
            "daily_stats": daily_stats,
            "adherence": {
                "met_target_days": days_met_target,
                "logged_days": total_calories_logged_days,
                "percentage": adherence_percentage,
                "streak": 0 # TODO: Calculate actual monthly streak if needed
            },
            "weight_change": weight_change,
            "month_name": today.strftime("%B"),
            "today_date": today.strftime("%Y-%m-%d"),
            "user_profile": {
                "name": user.username, # Ideally use full name if available
                "age": profile.age,
                "gender": profile.gender,
                "height": profile.height_cm,
                "current_weight": profile.weight_kg,
                "start_weight": start_weight,
                "end_weight": end_weight,
                "goal": profile.goal,
                "bmi": bmi,
                "bmi_category": bmi_category
            },
            "insights": insights
        })

class SleepLogView(generics.ListCreateAPIView):
    serializer_class = SleepLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        # Fetch last 30 days for history chart
        end_date = date.today()
        start_date = end_date - timedelta(days=30)
        logs = SleepLog.objects.filter(user=user, date__range=[start_date, end_date]).order_by('-date')
        
        return Response(SleepLogSerializer(logs, many=True).data)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from io import BytesIO
import base64
from django.template.loader import render_to_string
from django.http import HttpResponse
from xhtml2pdf import pisa

class GenerateMonthlyReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()
        
        try:
            profile = user.profile
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
            
        start_date = today.replace(day=1)
        end_date = today
        
        # 1. Fetch Data
        logs = FoodLog.objects.filter(user=user, date_eaten__gte=start_date, date_eaten__lte=end_date).order_by('date_eaten')
        weight_logs = WeightLog.objects.filter(user=user, date__gte=start_date, date__lte=end_date).order_by('date')
        
        days_in_month = (end_date - start_date).days + 1
        dates = [start_date + timedelta(days=x) for x in range(days_in_month)]
        
        daily_cals = []
        daily_weight = []
        logged_days_count = 0
        met_target_count = 0
        total_cals_all_days = 0
        
        current_weight = profile.weight_kg
        start_weight_val = profile.weight_kg
        end_weight_val = profile.weight_kg
        
        if weight_logs.exists():
            start_weight_val = weight_logs.first().weight_kg
            end_weight_val = weight_logs.last().weight_kg
            
        weight_map = {log.date: log.weight_kg for log in weight_logs}
        last_known_weight = start_weight_val
        
        for d in dates:
            day_logs = [l for l in logs if l.date_eaten == d]
            cals = sum(l.calories for l in day_logs)
            daily_cals.append(cals)
            
            if cals > 0:
                logged_days_count += 1
                total_cals_all_days += cals
                if 0.9 * profile.daily_calorie_target <= cals <= 1.1 * profile.daily_calorie_target:
                   met_target_count += 1
            
            if d in weight_map:
                last_known_weight = weight_map[d]
            daily_weight.append(last_known_weight)

        # 2. Charts
        plt.figure(figsize=(10, 4))
        plt.plot([d.day for d in dates], daily_weight, marker='o', linestyle='-', color='#0d9488', linewidth=2, markersize=4)
        plt.title('Weight Progress')
        plt.grid(True, linestyle='--', alpha=0.5)
        plt.tight_layout()
        
        buffer = BytesIO()
        plt.savefig(buffer, format='png', transparent=True)
        buffer.seek(0)
        weight_chart_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        plt.close()
        
        plt.figure(figsize=(10, 4))
        plt.bar([d.day for d in dates], daily_cals, color='#2dd4bf', alpha=0.7)
        plt.axhline(y=profile.daily_calorie_target, color='#ef4444', linestyle='--', linewidth=2)
        plt.title('Daily Calories vs Target')
        plt.tight_layout()
        
        buffer = BytesIO()
        plt.savefig(buffer, format='png', transparent=True)
        buffer.seek(0)
        calorie_chart_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        plt.close()
        
        # 3. Stats
        avg_calories = round(total_cals_all_days / logged_days_count) if logged_days_count > 0 else 0
        weight_change = round(end_weight_val - start_weight_val, 1)
        
        height_m = profile.height_cm / 100
        bmi = round(end_weight_val / (height_m * height_m), 1)
        bmi_cat = "Normal"
        if bmi < 18.5: bmi_cat = "Underweight"
        elif 25 <= bmi < 30: bmi_cat = "Overweight"
        elif bmi >= 30: bmi_cat = "Obese"
        
        insights = []
        if met_target_count / days_in_month > 0.5:
             insights.append("Good consistency hitting calorie targets.")
        else:
             insights.append("Focus on hitting your calorie target more frequently.")
        
        if profile.goal == 'Lose' and weight_change < 0:
             insights.append("You are successfully losing weight.")
        elif profile.goal == 'Gain' and weight_change > 0:
             insights.append("You are successfully gaining weight.")
             
        # 4. Render PDF using xhtml2pdf
        context = {
            'month_name': today.strftime("%B %Y"),
            'user_profile': {
                'name': user.username,
                'goal': profile.goal,
                'age': profile.age,
                'gender': profile.gender,
                'height': profile.height_cm,
                'current_weight': end_weight_val,
                'start_weight': start_weight_val,
                'end_weight': end_weight_val,
                'bmi': bmi,
                'bmi_category': bmi_cat
            },
            'weight_change': weight_change,
            'avg_daily_calories': avg_calories,
            'weight_chart': weight_chart_b64,
            'calorie_chart': calorie_chart_b64,
            'adherence': {
                'logged_days': logged_days_count,
                'met_target_days': met_target_count,
                'streak': 0 
            },
            'total_days_in_month': days_in_month,
            'insights': insights
        }
        
        html_string = render_to_string('pdf/monthly_report.html', context)
        
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Monthly_Report_{today.strftime("%B")}.pdf"'
        
        pisa_status = pisa.CreatePDF(html_string, dest=response)
        
        if pisa_status.err:
            return HttpResponse('We had some errors <pre>' + html_string + '</pre>')
            
        return response

class DeleteFoodLogView(generics.DestroyAPIView):
    queryset = FoodLog.objects.all()
    serializer_class = FoodLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

class DeleteWaterLogView(generics.DestroyAPIView):
    queryset = WaterLog.objects.all()
    serializer_class = WaterLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

class DeleteWeightLogView(generics.DestroyAPIView):
    queryset = WeightLog.objects.all()
    serializer_class = WeightLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

class DeleteExerciseLogView(generics.DestroyAPIView):
    queryset = ExerciseLog.objects.all()
    serializer_class = ExerciseLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

class DeleteSleepLogView(generics.DestroyAPIView):
    queryset = SleepLog.objects.all()
    serializer_class = SleepLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

