from django.urls import path
from . import views

app_name = 'chatbot'

urlpatterns = [
    # --- [수정] ---
    # config/urls.py에서 이미 '/api/chatbot/' 경로를 지정해주었기 때문에,
    # 여기서는 중복되는 'api/' 부분을 제거합니다.
    path('recommendation/', views.get_recommendation_api, name='get_recommendation'),
]
