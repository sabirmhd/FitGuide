from django.urls import path
from .views import UpdateProfileView, SearchFoodView, LogFoodView, DashboardSummaryView, WeeklyStatsView, WaterIntakeView, WeightTrackerView, ExerciseLogView, DietSuggestionView, MonthlyStatsView, SleepLogView, GenerateMonthlyReportView, DeleteFoodLogView, DeleteWaterLogView, DeleteWeightLogView, DeleteExerciseLogView, DeleteSleepLogView
from .views_auth import RegisterView, CustomLoginView, LogoutView, PasswordResetRequestView, PasswordResetConfirmView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('update-profile/', UpdateProfileView.as_view(), name='update-profile'),
    path('search-food/', SearchFoodView.as_view(), name='search-food'),
    path('log-food/', LogFoodView.as_view(), name='log-food'),
    path('dashboard-summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('stats/weekly/', WeeklyStatsView.as_view(), name='stats-weekly'),
    path('stats/monthly/', MonthlyStatsView.as_view(), name='stats-monthly'),
    path('water/', WaterIntakeView.as_view(), name='water-intake'),
    path('weight/', WeightTrackerView.as_view(), name='weight-tracker'),
    path('activity/', ExerciseLogView.as_view(), name='activity-tracker'),
    path('diet-suggestions/', DietSuggestionView.as_view(), name='diet-suggestions'),
    path('sleep/', SleepLogView.as_view(), name='sleep-tracker'),
    path('monthly-report-pdf/', GenerateMonthlyReportView.as_view(), name='monthly-report-pdf'),
    path('log-food/<int:pk>/', DeleteFoodLogView.as_view(), name='delete-food-log'),
    path('water/<int:pk>/', DeleteWaterLogView.as_view(), name='delete-water-log'),
    path('weight/<int:pk>/', DeleteWeightLogView.as_view(), name='delete-weight-log'),
    path('activity/<int:pk>/', DeleteExerciseLogView.as_view(), name='delete-activity-log'),
    path('sleep/<int:pk>/', DeleteSleepLogView.as_view(), name='delete-sleep-log'),
    path('sleep/<int:pk>/', DeleteSleepLogView.as_view(), name='delete-sleep-log'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
