from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BuildingViewSet, BuildingMetaView

router = DefaultRouter()
router.register(r"buildings", BuildingViewSet, basename="building")

urlpatterns = [
    path("buildings/meta/", BuildingMetaView.as_view(), name="buildings-meta"),
    path("", include(router.urls)),
]