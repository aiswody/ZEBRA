# activities/views.py
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from buildings.models import Building
from .serializers import ActivitiesSubmitSerializer

# ⬇️ 추가 (drf_yasg)
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


class ActivitiesSubmitView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="연료/전기/면적 입력 한 번에 저장",
        request_body=ActivitiesSubmitSerializer,                         # ✅ 요청 바디 명시
        responses={
            200: openapi.Response(
                description="저장 성공",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "buildingId": openapi.Schema(type=openapi.TYPE_INTEGER),
                        "year":       openapi.Schema(type=openapi.TYPE_INTEGER),
                        "saved":      openapi.Schema(type=openapi.TYPE_BOOLEAN),
                    }
                )
            ),
            400: "Validation error",
            403: "Forbidden",
            404: "Not Found",
        },
    )
    def post(self, request, building_id: int):
        building = get_object_or_404(Building, pk=building_id, is_archived=False)

        try:
            if building.institution != request.user.account.institution:
                return Response({"detail": "다른 기관의 건물입니다."}, status=403)
        except Exception:
            return Response({"detail": "사용자 계정에 기관이 연결되어 있지 않습니다."}, status=400)

        serializer = ActivitiesSubmitSerializer(data=request.data, context={"building": building})
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        return Response(result, status=status.HTTP_200_OK)
