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


'''
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
    """
    기관 + 담당자(유저) 동시 등록
    """
    s = RegisterSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    result = s.save()
    return Response(result, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@authentication_classes([JWTAuthentication])   # ⬅️ JWT 인증을 뷰에 명시
@permission_classes([IsAuthenticated])
def me(request):
    """
    로그인한 담당자의 프로필 + 소속 기관 정보
    """
    # (디버깅용) 헤더가 실제로 들어오는지 확인하고 싶으면 주석 해제
    # print("AUTH HEADER:", request.META.get("HTTP_AUTHORIZATION"))

    u = request.user
    try:
        acc = Account.objects.select_related("institution").get(user=u)
    except Account.DoesNotExist:
        return Response({"detail": "Account not found for this user."},
                        status=status.HTTP_404_NOT_FOUND)

    data = MeSerializer({
        "id": u.id,
        "username": u.username,
        "email": u.email,
        "managerName": acc.manager_name,
        "department": acc.department,
        "phoneNumber": acc.phone_number,
        "institution": acc.institution,
    }).data
    return Response(data, status=status.HTTP_200_OK)
'''