from django.urls import path
from .views import ActivitiesSubmitView, ActivitiesDetailView, ActivitiesSummaryView

urlpatterns = [
    path("buildings/<int:building_id>/submit", ActivitiesSubmitView.as_view(), name="activities-submit"),
    path("buildings/<int:building_id>/detail", ActivitiesDetailView.as_view(), name="activities-detail"),
    path("summary", ActivitiesSummaryView.as_view(), name="activities-summary"),
]