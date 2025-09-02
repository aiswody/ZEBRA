from django.urls import path
from .views import UserBuildingsView, AIAnalysisView

urlpatterns = [
    path('buildings/', UserBuildingsView.as_view(), name='user-buildings'),
    path('analyze/', AIAnalysisView.as_view(), name='ai-analysis'),
]
