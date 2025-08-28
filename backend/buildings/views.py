# buildings/views.py
from django.db import transaction, IntegrityError
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Building
from .serializers import BuildingCreateSerializer, BuildingListSerializer

# 자식 테이블들 (Building FK 보유)
from activities.models import Scope1FuelUsage, ElectricityUsage, AreaInfo
from emissions.models import EmissionAgg


class BuildingViewSet(viewsets.ModelViewSet):
    """
    GET    /api/buildings/            -> BuildingListSerializer (search/order 지원)
    POST   /api/buildings/            -> BuildingCreateSerializer (use_type/lat/lng 매핑)
    PATCH  /api/buildings/{id}/       -> BuildingCreateSerializer (중복검사 시 self.instance 제외)
    PUT    /api/buildings/{id}/       -> BuildingCreateSerializer
    DELETE /api/buildings/{id}/       -> 하드 삭제 (연관 데이터 먼저 삭제 후 건물 삭제)
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "address", "place_id"]
    ordering_fields = ["created_at", "name"]
    ordering = ["-created_at"]

    def _get_institution(self, user):
        # user.account.institution 경로 방어
        try:
            return user.account.institution
        except Exception:
            raise ValidationError({"institution": "사용자 계정에 기관이 연결되어 있지 않습니다."})

    def get_queryset(self):
        user = self.request.user
        inst = self._get_institution(user)
        qs = Building.objects.filter(institution=inst, is_archived=False)

        # 기존 쿼리 파라미터 'q' 호환 (name 부분 일치)
        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(name__icontains=q.strip())

        # SearchFilter/OrderingFilter는 나머지 필터/정렬 처리
        return qs

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return BuildingCreateSerializer
        return BuildingListSerializer

    def perform_create(self, serializer):
        # serializer.create()가 request.context로 institution/created_by 세팅함
        serializer.save()

    def _delete_children_first(self, building: Building):
        """
        일부 DB(FK 스키마 불일치 등)에서 CASCADE가 보장되지 않는 경우를 대비해
        자식 → 부모 순으로 명시적으로 삭제한다.
        """
        Scope1FuelUsage.objects.filter(building=building).delete()
        ElectricityUsage.objects.filter(building=building).delete()
        AreaInfo.objects.filter(building=building).delete()
        EmissionAgg.objects.filter(building=building).delete()

    # X 버튼 → 하드 삭제 (자식 선삭제 + 부모 삭제)
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            with transaction.atomic():
                # 1) 자식들 먼저 정리
                self._delete_children_first(instance)
                # 2) 부모(건물) 삭제
                instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except IntegrityError as e:
            # 숨은 FK 참조가 남아 있으면 여기로 떨어진다.
            return Response(
                {
                    "detail": "무결성 제약 위반(FOREIGN KEY constraint failed)",
                    "hint": "Building을 참조하는 다른 테이블이 남아 있을 수 있습니다. FK 스키마와 on_delete 설정, 관련 데이터 존재 여부를 확인하세요.",
                    "error": str(e),
                },
                status=status.HTTP_409_CONFLICT,
            )


class BuildingMetaView(APIView):
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        usages = [{"code": c, "label": l} for c, l in Building.Usage.choices]
        providers = [{"code": c, "label": l} for c, l in Building.Provider.choices]
        return Response({"usages": usages, "providers": providers})
