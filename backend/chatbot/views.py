import os
import json
from openai import OpenAI

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Subquery, OuterRef

from buildings.models import Building
from emissions.models import EmissionAgg
from .serializers import ChatbotBuildingDataSerializer

def run_deepseek_analysis(building_data):
    """
    Hugging Face Inference API를 통해 DeepSeek 모델을 호출하여 분석을 수행합니다.
    """
    api_key = os.getenv("HF_TOKEN")
    if not api_key:
        return "<p>서버에 Hugging Face API 키(HF_TOKEN)가 설정되지 않았습니다. 관리자에게 문의하세요.</p>"

    try:
        client = OpenAI(
            base_url="https://router.huggingface.co/v1",
            api_key=api_key,
        )

        formatted_data = json.dumps(building_data, indent=2, ensure_ascii=False)
        
        system_prompt = """
        당신은 건물의 온실가스(GHG) 배출량 데이터 분석 전문가입니다.
        사용자가 제공한 건물 목록 데이터를 분석하여, 단위 면적(m²)당 온실가스 배출량이 가장 높은 건물을 찾아주세요.
        그 다음, 해당 건물의 배출량을 줄이기 위한 구체적이고 실천 가능한 방안 3가지를 제안해주세요.
        답변은 반드시 HTML 형식으로 생성해야 하며, 주요 키워드는 <strong> 태그로 강조해주세요.
        """
        user_prompt = f"""
        아래는 우리 기관이 소유한 건물들의 최신 데이터입니다.
        이 데이터를 분석하여 온실가스 배출을 줄이기 위한 방안을 추천해주세요.

        [건물 데이터]
        {formatted_data}
        """

        completion = client.chat.completions.create(
            model="deepseek-ai/DeepSeek-V3.1:fireworks-ai",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        
        content = completion.choices[0].message.content
        return content

    except Exception as e:
        print(f"Hugging Face API 호출 오류: {e}")
        return f"<p>AI 모델을 호출하는 중 오류가 발생했습니다. (오류: {e})</p>"


class UserBuildingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            institution = request.user.account.institution
        except AttributeError:
            return Response({"error": "사용자 계정에 연결된 기관 정보가 없습니다."}, status=status.HTTP_404_NOT_FOUND)

        latest_year_subquery = EmissionAgg.objects.filter(building=OuterRef('pk')).order_by('-year').values('year')[:1]
        latest_emissions_subquery = EmissionAgg.objects.filter(building=OuterRef('pk'), year=Subquery(latest_year_subquery)).values('total_kg')[:1]
        latest_area_subquery = EmissionAgg.objects.filter(building=OuterRef('pk'), year=Subquery(latest_year_subquery)).values('area_m2')[:1]

        buildings_with_latest_data = Building.objects.filter(
            institution=institution, is_archived=False
        ).annotate(
            latest_emissions_kg=Subquery(latest_emissions_subquery),
            latest_area_m2=Subquery(latest_area_subquery)
        ).filter(latest_emissions_kg__isnull=False)

        serializer = ChatbotBuildingDataSerializer(buildings_with_latest_data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AIAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        building_data = request.data.get('buildings')
        if not building_data:
            return Response({'error': '건물 데이터가 필요합니다.'}, status=status.HTTP_400_BAD_REQUEST)
        
        recommendation = run_deepseek_analysis(building_data)
        return Response({'recommendation': recommendation}, status=status.HTTP_200_OK)