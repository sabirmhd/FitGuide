from rest_framework import serializers
from .models import Profile, FoodLog, WaterLog, WeightLog, ExerciseLog, SleepLog
from django.contrib.auth.models import User

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Profile
        fields = [
            'id', 'username', 'gender', 'age', 'height_cm', 'weight_kg', 
            'activity_level', 'goal', 'tdee', 'daily_calorie_target',
            'reminders_enabled'
        ]
        read_only_fields = ['tdee', 'daily_calorie_target']

class FoodLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodLog
        fields = '__all__'
        read_only_fields = ['user', 'date_eaten']

class WaterLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaterLog
        fields = '__all__'
        read_only_fields = ['user', 'date_eaten']

class WeightLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightLog
        fields = '__all__'
        read_only_fields = ['user', 'date']

class ExerciseLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseLog
        fields = '__all__'
        read_only_fields = ['user', 'date']

class SleepLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SleepLog
        fields = '__all__'
        read_only_fields = ['user', 'date']
