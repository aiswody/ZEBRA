import os
import openai
from django.conf import settings

openai.api_key = settings.OPENAI_API_KEY

def get_gpt_recommendation(question, institution_type, fuel_ratio, user_emission):
    prompt = f"""
    기관 유형: {institution_type}
    연료 사용 비율: {fuel_ratio}
    총 배출량: {user_emission}
    
    질문: {question}
    
    위 정보를 기반으로 온실가스 감축 추천 방안을 작성해 주세요.
    """
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role":"user","content":prompt}],
        temperature=0.7,
    )
    return response.choices[0].message.content
