from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import openai, os

# FAQ (고정 답변)
FAQ = {
    "온실가스 감축 추천 방안": "기관 특성과 연료 사용 패턴에 맞는 AI 기반 감축 전략을 제공합니다.",
    "보고서 다운로드": "대시보드 상단 '보고서 다운로드' 버튼을 클릭하세요.",
}

@api_view(["POST"])
@permission_classes([IsAuthenticated])   # 로그인한 사용자만 이용 가능
def chatbot_reply(request):
    user = request.user
    question = request.data.get("question")

    # 1) FAQ에서 먼저 확인
    if question in FAQ:
        return Response({"answer": FAQ[question]})

    # 2) DB에서 사용자 관련 정보 불러오기 (예시)
    institution_type = user.institution.type if hasattr(user, "institution") else "일반기관"

    # 사용자의 건물, 연료 사용 내역 가져오기 (예시)
    buildings = user.institution.buildings.all()
    fuel_usages = []
    for b in buildings:
        for usage in b.scope1_usages.all():
            fuel_usages.append({
                "year": usage.year,
                "category": usage.category,
                "amount": float(usage.amount),
                "unit": usage.unit,
            })

    # 3) GPT API 호출
    openai.api_key = os.getenv("OPENAI_API_KEY")

    messages = [
        {"role": "system", "content": "너는 온실가스 감축 컨설턴트야. 기관 유형과 연료 사용 패턴에 맞게 현실적인 방안을 제시해."},
        {"role": "user", "content": f"기관 유형: {institution_type}, 연료 사용량: {fuel_usages}"},
        {"role": "user", "content": f"질문: {question}"}
    ]

    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini", 
            messages=messages,
            max_tokens=300,
        )
        ai_answer = response.choices[0].message.content
    except Exception as e:
        ai_answer = f"AI 분석 중 오류가 발생했습니다: {str(e)}"

    return Response({"answer": ai_answer})
