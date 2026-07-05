# accounts/views.py
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from rest_framework_simplejwt.authentication import JWTAuthentication

from .serializers import RegisterSerializer, MeSerializer
from .models import Account


@swagger_auto_schema(method='post', request_body=RegisterSerializer)
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    s = RegisterSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    result = s.save()
    return Response(result, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def me(request):
    """
    로그인한 담당자의 프로필 + 소속 기관 정보 (last_login 포함)
    """
    try:
        account = Account.objects.select_related("user", "institution").get(user=request.user)
    except Account.DoesNotExist:
        return Response({"detail": "Account not found for this user."}, status=status.HTTP_404_NOT_FOUND)

    data = MeSerializer(account).data   # ✅ dict 수동 조립 불필요
    return Response(data, status=status.HTTP_200_OK)