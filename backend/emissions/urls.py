from rest_framework.routers import DefaultRouter
from .views import EnergyUsageViewSet, EmissionResultViewSet

router = DefaultRouter()
router.register(r'energy-usage', EnergyUsageViewSet, basename='energy-usage')
router.register(r'emissions', EmissionResultViewSet, basename='emissions')
urlpatterns = router.urls