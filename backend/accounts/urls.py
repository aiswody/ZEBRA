from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import register, me
from .auth import IdTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class IdTokenObtainPairView(TokenObtainPairView):
    serializer_class = IdTokenObtainPairSerializer

urlpatterns = [
    path("register/", register),                 # POST
    path("login/", IdTokenObtainPairView.as_view()),  # POST (id or username, password)
    path("refresh/", TokenRefreshView.as_view()),     # POST (refresh)
    path("me/", me),                              # GET  (Bearer <access>)
]


