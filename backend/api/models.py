from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
    ]
    
    ACTIVITY_CHOICES = [
        ('1.2', 'Sedentary'),
        ('1.375', 'Lightly Active'),
        ('1.55', 'Moderately Active'),
        ('1.725', 'Very Active'),
        ('1.9', 'Super Active'),
    ]
    
    GOAL_CHOICES = [
        ('Lose', 'Lose Weight'),
        ('Maintain', 'Maintain Weight'),
        ('Gain', 'Gain Weight'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    age = models.IntegerField()
    height_cm = models.FloatField()
    weight_kg = models.FloatField()
    activity_level = models.CharField(max_length=10, choices=ACTIVITY_CHOICES)
    goal = models.CharField(max_length=10, choices=GOAL_CHOICES)
    
    tdee = models.FloatField(blank=True, null=True)
    daily_calorie_target = models.FloatField(blank=True, null=True)
    reminders_enabled = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class FoodLog(models.Model):
    MEAL_CHOICES = [
        ('Breakfast', 'Breakfast'),
        ('Lunch', 'Lunch'),
        ('Dinner', 'Dinner'),
        ('Snack', 'Snack'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='food_logs')
    food_name = models.CharField(max_length=255)
    calories = models.IntegerField()
    protein = models.FloatField()
    carbs = models.FloatField()
    fats = models.FloatField()
    date_eaten = models.DateField(auto_now_add=True)
    meal_type = models.CharField(max_length=20, choices=MEAL_CHOICES)

    def __str__(self):
        return f"{self.food_name} ({self.calories} cal)"

class WaterLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='water_logs')
    amount_ml = models.IntegerField()
    date_eaten = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.amount_ml}ml - {self.date_eaten}"

class WeightLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='weight_logs')
    weight_kg = models.FloatField()
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.weight_kg}kg - {self.date}"

class ExerciseLog(models.Model):
    EXERCISE_TYPES = [
        ('Cardio', 'Cardio'),
        ('Strength', 'Strength'),
        ('Yoga', 'Yoga'),
        ('Other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exercise_logs')
    exercise_type = models.CharField(max_length=20, choices=EXERCISE_TYPES)
    description = models.CharField(max_length=255, blank=True)
    duration_minutes = models.IntegerField()
    calories_burned = models.IntegerField()
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.exercise_type} ({self.duration_minutes}m)"

class SleepLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sleep_logs')
    date = models.DateField(auto_now_add=True)
    bedtime = models.TimeField()
    wake_time = models.TimeField()
    duration_minutes = models.IntegerField()
    quality_score = models.IntegerField(default=0) # 0-100
    
    # Sleep Stages breakdown (optional/manual)
    deep_sleep_minutes = models.IntegerField(default=0)
    light_sleep_minutes = models.IntegerField(default=0)
    rem_sleep_minutes = models.IntegerField(default=0)
    awake_minutes = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.duration_minutes}m ({self.date})"
