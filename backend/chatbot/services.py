# requests 대신 openai 라이브러리를 사용합니다.
import os
import json
from openai import OpenAI, APIError

# AI 연결 관련 에러를 명확하게 구분하기 위한 커스텀 예외 클래스
class AIConnectionError(Exception):
    pass

def get_deepseek_recommendation(institution, building_data):
    """
    기관 및 건물 데이터를 바탕으로 Hugging Face Inference API를 호출하여
    온실가스 감축 방안을 추천받는 함수
    """
    # --- [수정됨] ---
    # .env 파일에서 HF_TOKEN을 불러옵니다.
    api_key = os.getenv("HF_TOKEN")

    if not api_key:
        raise AIConnectionError("서버에 HF_TOKEN이 설정되지 않았습니다. .env 파일을 확인해주세요.")

    # --- [수정됨] ---
    # 제공해주신 코드에 맞춰 OpenAI 클라이언트를 설정합니다.
    client = OpenAI(
        base_url="https://router.huggingface.co/v1",
        api_key=api_key,
    )

    system_prompt = (
        "당신은 온실가스 배출량 데이터 분석 및 감축 컨설팅 전문가입니다. "
        "주어진 기관의 건물별 상세 온실가스 배출량 데이터(총 배출량, Scope 1, Scope 2 등)를 심층 분석해야 합니다. "
        "데이터를 바탕으로, 어떤 건물의 어떤 배출원(Scope)이 가장 문제인지 지적하고, 이를 해결하기 위한 구체적이고 실행 가능한 감축 방안 3가지를 제안해야 합니다. "
        "각 제안은 예상 감축량과 데이터 기반의 명확한 근거를 포함해야 합니다. 전문가적인 톤으로 Markdown 형식의 리스트로 답변해주세요."
    )
    
    user_prompt = (
        f"우리 기관 '{institution.name}'의 온실가스 배출량을 줄일 수 있는 방법을 알려줘. "
        f"최신 연도의 건물별 상세 배출량 데이터는 다음과 같아:\n\n"
        f"{json.dumps(building_data, indent=2, ensure_ascii=False)}\n\n"
        "위 데이터를 심층 분석해서 맞춤형 감축 방안을 제안해줘."
    )

    try:
        # --- [수정됨] ---
        # Hugging Face API를 호출합니다.
        completion = client.chat.completions.create(
            model="deepseek-ai/DeepSeek-V3.1:fireworks-ai", # 사용하시려는 모델명
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.5,
            max_tokens=1024,
        )
        
        # 응답에서 추천 내용을 추출합니다.
        recommendation_text = completion.choices[0].message.content
        return recommendation_text

    except APIError as e:
        # openai 라이브러리에서 발생하는 에러를 처리합니다.
        error_message = f"AI 모델과 통신하는 중 오류가 발생했습니다: {e}"
        print(error_message)
        raise AIConnectionError(error_message)
