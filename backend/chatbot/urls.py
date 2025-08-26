from django.urls import path
from chatbot.views import chatbot_reply

urlpatterns = [
    path("recommend/", chatbot_reply, name="chatbot-recommend"),
]
