from django.urls import path
from .views import ActivitiesSubmitView

urlpatterns = [
    path("buildings/<int:building_id>/submit", ActivitiesSubmitView.as_view(), name="activities-submit"),
]
