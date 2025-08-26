# activities/views.py
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from django.utils import timezone
from buildings.models import Building
from .serializers import (
    ActivitiesSubmitSerializer,
    ActivitiesDetailOutSerializer,
    ActivitiesSummaryItemSerializer,
)
from .models import Scope1FuelUsage, ElectricityUsage, AreaInfo, FuelCategory
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


def _assert_same_institution(request, building: Building):
    try:
        return building.institution == request.user.account.institution
    except Exception:
        return False


class ActivitiesSubmitView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="연료/전기/면적 입력 한 번에 저장",
        request_body=ActivitiesSubmitSerializer,
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

        if not _assert_same_institution(request, building):
            return Response({"detail": "다른 기관의 건물입니다."}, status=403)

        serializer = ActivitiesSubmitSerializer(data=request.data, context={"building": building})
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        return Response(result, status=status.HTTP_200_OK)


class ActivitiesDetailView(APIView):
    """
    GET /api/activities/buildings/<id>/detail?year=YYYY
    단일 건물 + 연도에 대한 저장된 값(합계 위주) 조회
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="단일 건물 연도별 입력값 조회(합계)",
        manual_parameters=[
            openapi.Parameter("year", openapi.IN_QUERY, type=openapi.TYPE_INTEGER, required=True)
        ],
        responses={200: ActivitiesDetailOutSerializer, 403: "Forbidden", 404: "Not Found"}
    )
    def get(self, request, building_id: int):
        year = int(request.query_params.get("year"))
        building = get_object_or_404(Building, pk=building_id, is_archived=False)

        if not _assert_same_institution(request, building):
            return Response({"detail": "다른 기관의 건물입니다."}, status=403)

        # Scope1 카테고리별
        s1_map = {}
        for cat in [FuelCategory.SOLID, FuelCategory.LIQUID, FuelCategory.GAS]:
            row = Scope1FuelUsage.objects.filter(building=building, year=year, category=cat).first()
            if row:
                s1_map_key = {FuelCategory.SOLID: "solid", FuelCategory.LIQUID: "liquid", FuelCategory.GAS: "gas"}[cat]
                s1_map[s1_map_key] = {
                    "tier": row.tier,
                    "unit": row.unit,
                    # 저장은 합계지만, UI는 amounts 배열을 기대하므로 단일 항목 배열로 제공
                    "amounts": [row.amount],
                    "emission_factor": row.emission_factor,
                    "calorific_value": row.calorific_value,
                }

        # Scope2
        elec = ElectricityUsage.objects.filter(building=building, year=year).first()
        scope2 = {"electricity": {"kwhs": [elec.total_kwh]}} if elec else {}

        # Areas
        area = AreaInfo.objects.filter(building=building, year=year).first()
        areas = None
        if area:
            areas = {"gross": area.gross_area, "conditioned": area.conditioned_area}

        out = {
            "buildingId": building.id,
            "buildingName": building.name,
            "year": year,
            "scope1": s1_map if s1_map else {},
            "scope2": scope2,
            "areas": areas,
        }
        ser = ActivitiesDetailOutSerializer(out)
        return Response(ser.data, status=200)


class ActivitiesSummaryView(APIView):
    """
    GET /api/activities/summary?year=YYYY
    로그인 사용자의 기관 소속 건물 전체에 대해, 해당 연도의 합계 목록을 반환
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="연료 사용량 관리 목록(기관 전체, 연도별 합계)",
        manual_parameters=[
            openapi.Parameter("year", openapi.IN_QUERY, type=openapi.TYPE_INTEGER, required=False),
        ],
        responses={200: ActivitiesSummaryItemSerializer(many=True), 403: "Forbidden"}
    )
    def get(self, request):
        user_inst = getattr(getattr(request.user, "account", None), "institution", None)
        if not user_inst:
            return Response({"detail": "사용자 기관이 없습니다."}, status=400)

        try:
            year = int(request.query_params.get("year"))
        except (TypeError, ValueError):
            year = timezone.now().year

        # 해당 기관의 활성 건물
        buildings = Building.objects.filter(institution=user_inst, is_archived=False)

        items = []
        for b in buildings:
            row = {"buildingId": b.id, "buildingName": b.name, "year": year}
            # scope1 카테고리 합계
            s1s = Scope1FuelUsage.objects.filter(building=b, year=year)
            for s1 in s1s:
                key = {FuelCategory.SOLID: "solid_amount", FuelCategory.LIQUID: "liquid_amount", FuelCategory.GAS: "gas_amount"}[s1.category]
                row[key] = s1.amount
            # scope2
            elec = ElectricityUsage.objects.filter(building=b, year=year).first()
            if elec:
                row["total_kwh"] = elec.total_kwh
            # area
            area = AreaInfo.objects.filter(building=b, year=year).first()
            if area:
                row["gross_area"] = area.gross_area
                row["conditioned_area"] = area.conditioned_area

            items.append(row)

        ser = ActivitiesSummaryItemSerializer(items, many=True)
        return Response(ser.data, status=200)