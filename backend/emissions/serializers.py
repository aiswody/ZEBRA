from rest_framework import serializers
from .models import EnergyUsage, EmissionResult

class EnergyUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnergyUsage
        fields = '__all__'  # 실제로는 허용 필드만

class EmissionResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmissionResult
        fields = ('building','year','month','scope1_tco2e','scope2_tco2e',
                  'total_tco2e','intensity_total_per_m2')