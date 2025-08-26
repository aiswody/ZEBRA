# dashboard/views.py 또는 새로운 chatbot/views.py

import openai
from django.conf import settings
from django.db.models import Sum
from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from buildings.models import Building # 빌딩 모델 경로에 맞게 수정
from emissions.models import EmissionAgg # EmissionAgg 모델 경로에 맞게 수정

# OpenAI API 키 설정
openai.api_key = settings.OPENAI_API_KEY

class ChatbotView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def _build_prompt(self, request):
        """
        GPT에게 보낼 프롬프트를 동적으로 생성하는 함수
        """
        user_inst = request.user.account.institution
        current_year = 2025 # 예시 연도, 필요시 파라미터로 받으세요.

        # 1. 기관 정보 및 건물 리스트 조회
        buildings = Building.objects.filter(institution=user_inst, is_archived=False)
        building_list_str = ", ".join([b.name for b in buildings])

        # 2. 기관 전체의 배출량 합계 조회
        emission_data = EmissionAgg.objects.filter(
            building__institution=user_inst,
            year=current_year
        ).aggregate(
            total_solid_kg=Sum('scope1_solid_kg'),
            total_liquid_kg=Sum('scope1_liquid_kg'),
            total_gas_kg=Sum('scope1_gas_kg'),
            total_elec_kg=Sum('scope2_elec_kg'),
            total_area=Sum('area_m2')
        )

        # 3. 프롬프트 템플릿 생성
        prompt = f"""
        당신은 건물 에너지 관리 및 탄소 감축 컨설팅 전문가입니다.
        아래에 제공된 데이터를 바탕으로, 해당 기관을 위한 구체적이고 실행 가능한 '탄소 감축 추천 방안'을 단계별로 제시해 주세요.
        결과는 전문가적인 톤을 유지하되, 일반인도 이해하기 쉽게 설명하고 Markdown 형식을 사용해 가독성을 높여주세요.

        ### 기관 기본 정보
        - **기관명**: {user_inst.name}
        - **보유 건물**: {building_list_str}
        - **총 연면적**: {emission_data['total_area'] or 0:,.0f} m²

        ### {current_year}년도 온실가스 배출량 현황 (단위: kgCO2eq)
        - **Scope 1 (직접 배출)**:
          - 고체 연료(석탄 등): {emission_data['total_solid_kg'] or 0:,.0f} kg
          - 액체 연료(경유 등): {emission_data['total_liquid_kg'] or 0:,.0f} kg
          - 기체 연료(LNG 등): {emission_data['total_gas_kg'] or 0:,.0f} kg
        - **Scope 2 (간접 배출)**:
          - 전력 사용: {emission_data['total_elec_kg'] or 0:,.0f} kg

        ### 요청 사항
        위 데이터를 분석하여, 다음 내용을 포함한 답변을 생성해 주세요.
        1.  **현황 진단**: 현재 배출량 데이터에서 가장 큰 비중을 차지하는 에너지원은 무엇이며, 어떤 의미를 갖는지 간략히 설명.
        2.  **단기적 감축 방안**: 적은 비용으로 즉시 실행할 수 있는 방안 (예: 에너지 절약 캠페인, 조명 교체 등).
        3.  **중장기적 감축 방안**: 설비 투자나 시스템 개선이 필요한 방안 (예: 고효율 냉난방기 교체, 신재생에너지 설비 도입 등).
        4.  **기대 효과**: 제안한 방안들을 실행했을 때 예상되는 정성적/정량적 효과.

        이제 답변을 시작해 주세요.
        """
        return prompt

    def post(self, request, *args, **kwargs):
        """
        POST 요청을 받아 GPT 답변을 스트리밍으로 반환
        """
        try:
            prompt = self._build_prompt(request)

            def stream_response():
                stream = openai.ChatCompletion.create(
                    model="gpt-4",  # 또는 "gpt-3.5-turbo"
                    messages=[
                        {"role": "system", "content": "당신은 유능한 탄소 감축 컨설턴트입니다."},
                        {"role": "user", "content": prompt}
                    ],
                    stream=True  # 스트리밍 응답 활성화
                )
                for chunk in stream:
                    content = chunk.choices[0].delta.get("content", "")
                    if content:
                        yield content

            # StreamingHttpResponse를 사용하여 실시간으로 데이터 전송
            return StreamingHttpResponse(stream_response(), content_type="text/event-stream")

        except Exception as e:
            # 실제 서비스에서는 로깅(logging) 처리를 하는 것이 좋습니다.
            return StreamingHttpResponse(
                [f"오류가 발생했습니다: {str(e)}"],
                status=500,
                content_type="text/event-stream"
            )