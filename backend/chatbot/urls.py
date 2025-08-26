from django.urls import path
from chatbot.views import ChatbotView

urlpatterns = [
    path('chatbot/ask-carbon-reduction/', ChatbotView.as_view(), name='chatbot_ask'),
]
