from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from .models import Building
from .serializers import BuildingCreateSerializer, BuildingListSerializer
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication

class BuildingViewSet(viewsets.ModelViewSet):
    """
    GET /api/buildings/           -> BuildingListSerializer (search/order 지원)
    POST /api/buildings/          -> BuildingCreateSerializer (use_type/lat/lng 매핑)
    PATCH/PUT /api/buildings/{id}/-> BuildingCreateSerializer (중복검사 시 self.instance 제외)
    DELETE /api/buildings/{id}/   -> 소프트 삭제 (is_archived=True)
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

    # X 버튼 → 소프트 삭제
    def destroy(self, request, *args, **kwargs):
        obj = self.get_object()
        obj.is_archived = True
        obj.save(update_fields=["is_archived"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class BuildingMetaView(APIView):
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        usages = [{"code": c, "label": l} for c, l in Building.Usage.choices]
        providers = [{"code": c, "label": l} for c, l in Building.Provider.choices]
        return Response({"usages": usages, "providers": providers})
