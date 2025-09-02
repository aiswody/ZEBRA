from rest_framework import serializers
from buildings.models import Building

class ChatbotBuildingDataSerializer(serializers.ModelSerializer):
    """챗봇 분석에 필요한 건물 데이터를 직렬화합니다."""
    # 모델에 직접 존재하지 않는 필드를 추가합니다.
    # source='latest_area_m2'는 views.py에서 annotate로 추가한 필드명을 가리킵니다.
    area = serializers.DecimalField(max_digits=18, decimal_places=2, source='latest_area_m2')
    emissions = serializers.SerializerMethodField()

    class Meta:
        model = Building
        fields = ['id', 'name', 'area', 'emissions']

    def get_emissions(self, obj):
        """
        annotate로 추가된 latest_emissions_kg 필드의 값을 tCO2eq 단위로 변환합니다.
        """
        if hasattr(obj, 'latest_emissions_kg') and obj.latest_emissions_kg is not None:
            # kg 단위를 톤(t) 단위로 변환
            return obj.latest_emissions_kg / 1000
        return 0
