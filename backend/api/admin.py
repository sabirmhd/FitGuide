from django.contrib import admin
from .models import Profile, FoodLog, WaterLog, WeightLog, ExerciseLog, SleepLog

# -------------------------
# Profile
# -------------------------
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'gender',
        'age',
        'height_cm',
        'weight_kg',
        'activity_level',
        'goal',
        'daily_calorie_target',
        'reminders_enabled',
    )
    list_filter = ('gender', 'goal', 'activity_level', 'reminders_enabled')
    search_fields = ('user__username',)


# -------------------------
# Food Log
# -------------------------
@admin.register(FoodLog)
class FoodLogAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'food_name',
        'meal_type',
        'calories',
        'protein',
        'carbs',
        'fats',
        'date_eaten',
    )
    list_filter = ('meal_type', 'date_eaten')
    search_fields = ('food_name', 'user__username')
    date_hierarchy = 'date_eaten'


# -------------------------
# Water Log
# -------------------------
@admin.register(WaterLog)
class WaterLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount_ml', 'date_eaten')
    list_filter = ('date_eaten',)
    search_fields = ('user__username',)
    date_hierarchy = 'date_eaten'


# -------------------------
# Weight Log
# -------------------------
@admin.register(WeightLog)
class WeightLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'weight_kg', 'date')
    list_filter = ('date',)
    search_fields = ('user__username',)
    date_hierarchy = 'date'


# -------------------------
# Exercise Log
# -------------------------
@admin.register(ExerciseLog)
class ExerciseLogAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'exercise_type',
        'duration_minutes',
        'calories_burned',
        'date',
    )
    list_filter = ('exercise_type', 'date')
    search_fields = ('user__username', 'description')
    date_hierarchy = 'date'


# -------------------------
# Sleep Log
# -------------------------
@admin.register(SleepLog)
class SleepLogAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'date',
        'duration_minutes',
        'quality_score',
        'deep_sleep_minutes',
        'light_sleep_minutes',
        'rem_sleep_minutes',
        'awake_minutes',
    )
    list_filter = ('date',)
    search_fields = ('user__username',)
    date_hierarchy = 'date'
