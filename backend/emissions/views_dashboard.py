# emissions/views_dashboard.py
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from .models import EmissionAgg
from .use_intensity import USE_INTENSITY, UNIT  # ← 용도별 고정 상수(18개) 사용

# 내부 헬퍼: 상수 조회
def _lookup_intensity(use_code: str, key: str):
    d = USE_INTENSITY.get(use_code)
    return d.get(key) if d else None


class Scope1BuildingsCompareView(APIView):
    """
    사용자(기관)가 추가한 모든 건물의 Scope1(고체/액체/가스) 배출량 나열
    GET /api/dashboard/scope1/buildings?year=2025
    """
    def get(self, req):
        year = int(req.query_params.get('year'))
        qs = (EmissionAgg.objects
              .filter(building__institution=req.user.account.institution, year=year)
              .select_related('building'))
        items = []
        for a in qs:
            items.append({
                "building_id": a.building_id,
                "building_name": a.building.name,
                "solid_kg": a.scope1_solid_kg,
                "liquid_kg": a.scope1_liquid_kg,
                "gas_kg": a.scope1_gas_kg,
                "scope1_total_kg": a.scope1_total_kg
            })
        return Response({"year": year, "items": items})


class Scope2BuildingsCompareView(APIView):
    """
    사용자(기관)가 추가한 모든 건물의 Scope2(전력) 배출량 나열
    GET /api/dashboard/scope2/buildings?year=2025
    """
    def get(self, req):
        year = int(req.query_params.get('year'))
        qs = (EmissionAgg.objects
              .filter(building__institution=req.user.account.institution, year=year)
              .select_related('building'))
        items = [{
            "building_id": a.building_id,
            "building_name": a.building.name,
            "electricity_kg": a.scope2_elec_kg
        } for a in qs]
        return Response({"year": year, "items": items})


class ScopeRatioView(APIView):
    """
    선택 건물의 Scope1 vs Scope2 비율(도넛)
    GET /api/dashboard/buildings/{id}/scope-ratio?year=2025
    """
    def get(self, req, id):
        year = int(req.query_params.get('year'))
        a = EmissionAgg.objects.get(building_id=id, year=year)
        total = float(a.total_kg) if a.total_kg else 1.0
        return Response({
            "year": year,
            "scope1_kg": a.scope1_total_kg,
            "scope2_kg": a.scope2_elec_kg,
            "scope1_pct": float(a.scope1_total_kg) / total,
            "scope2_pct": float(a.scope2_elec_kg) / total
        })


class YearlyTrendView(APIView):
    """
    선택 건물의 연도별 그래프(현재는 더미 형태도 허용)
    GET /api/dashboard/buildings/{id}/trend?year=2025&scope=total|scope1|scope2
    """
    def get(self, req, id):
        year = int(req.query_params.get('year'))
        scope = req.query_params.get('scope', 'total')
        a = EmissionAgg.objects.get(building_id=id, year=year)
        if scope == 'scope1':
            val = a.scope1_total_kg
        elif scope == 'scope2':
            val = a.scope2_elec_kg
        else:
            val = a.total_kg
        return Response({
            "x_axis": [str(year)],
            "series": {"periodic_total": [val], "cumulative": [val]},
            "unit": "kgCO2eq"
        })


class TotalTabView(APIView):
    """
    Total 탭 핵심 데이터
    GET /api/dashboard/buildings/<id>/total?year=2025
    """
    def get(self, req, id):
        year = int(req.query_params.get('year'))
        a = EmissionAgg.objects.get(building_id=id, year=year)

        # 기관 포트폴리오 평균(합배출/합면적)
        qs = EmissionAgg.objects.filter(
            building__institution=req.user.account.institution,
            year=year
        )
        sum_area = qs.aggregate(Sum('area_m2'))['area_m2__sum'] or 0
        avg = {
            "solid": float((qs.aggregate(Sum('scope1_solid_kg'))['scope1_solid_kg__sum'] or 0) / (sum_area or 1)),
            "liquid": float((qs.aggregate(Sum('scope1_liquid_kg'))['scope1_liquid_kg__sum'] or 0) / (sum_area or 1)),
            "gas": float((qs.aggregate(Sum('scope1_gas_kg'))['scope1_gas_kg__sum'] or 0) / (sum_area or 1)),
            "electricity": float((qs.aggregate(Sum('scope2_elec_kg'))['scope2_elec_kg__sum'] or 0) / (sum_area or 1)),
        }

        return Response({
            "summary": {
                "total_kg": a.total_kg,
                "scope1_kg": a.scope1_total_kg,
                "scope2_kg": a.scope2_elec_kg
            },
            "per_area_radar": {
                "building": {
                    "solid": a.i_solid, "liquid": a.i_liquid, "gas": a.i_gas, "electricity": a.i_elec
                },
                "portfolio_avg": avg,
                "unit": "kgCO2eq/m2"
            }
        })


class Scope1TabView(APIView):
    """
    Scope1 탭 데이터
    GET /api/dashboard/buildings/<id>/scope1?year=2025
    """
    def get(self, req, id):
        year = int(req.query_params.get('year'))
        a = EmissionAgg.objects.get(building_id=id, year=year)
        return Response({
            "summary": {"scope1_total_kg": a.scope1_total_kg},
            "by_fuel": {
                "solid_kg": a.scope1_solid_kg,
                "liquid_kg": a.scope1_liquid_kg,
                "gas_kg": a.scope1_gas_kg
            },
            "per_area": {
                "solid": a.i_solid, "liquid": a.i_liquid, "gas": a.i_gas,
                "unit": "kgCO2eq/m2"
            }
        })


class Scope2TabView(APIView):
    """
    Scope2 탭 데이터
    GET /api/dashboard/buildings/<id>/scope2?year=2025
    """
    def get(self, req, id):
        year = int(req.query_params.get('year'))
        a = EmissionAgg.objects.get(building_id=id, year=year)
        return Response({
            "summary": {"scope2_total_kg": a.scope2_elec_kg},
            "per_area": {"building": a.i_elec, "unit": "kgCO2eq/m2"}
        })


# ▼▼▼ 신규: 용도별 비교(상수 기반, 공공데이터를 DB에 넣지 않음) ▼▼▼

class Scope1UseCompareView(APIView):
    """
    선택 건물의 Scope1 면적당 배출량 vs 같은 용도(상수) 평균
    GET /api/dashboard/buildings/{id}/scope1/use-compare?year=2025
    """
    def get(self, req, id):
        year = int(req.query_params.get('year'))
        agg = EmissionAgg.objects.get(building_id=id, year=year)
        use_code = agg.building.use_code  # 예: "업무시설"

        bench_val = _lookup_intensity(use_code, "scope1")
        return Response({
            "year": year,
            "building": {"intensity": agg.i_solid + agg.i_liquid + agg.i_gas, "unit": UNIT},
            "category_avg": {"intensity": bench_val, "unit": UNIT}
        })


class Scope2UseCompareView(APIView):
    """
    선택 건물의 Scope2 면적당 배출량 vs 같은 용도(상수) 평균
    GET /api/dashboard/buildings/{id}/scope2/use-compare?year=2025
    """
    def get(self, req, id):
        year = int(req.query_params.get('year'))
        agg = EmissionAgg.objects.get(building_id=id, year=year)
        use_code = agg.building.use_code

        bench_val = _lookup_intensity(use_code, "scope2")
        return Response({
            "year": year,
            "building": {"intensity": agg.i_elec, "unit": UNIT},
            "category_avg": {"intensity": bench_val, "unit": UNIT}
        })


class TotalUseCompareView(APIView):
    """
    선택 건물의 Total 면적당 배출량 vs 같은 용도(상수) 평균
    GET /api/dashboard/buildings/{id}/total/use-compare?year=2025
    """
    def get(self, req, id):
        year = int(req.query_params.get('year'))
        agg = EmissionAgg.objects.get(building_id=id, year=year)
        use_code = agg.building.use_code

        bench_val = _lookup_intensity(use_code, "total")
        return Response({
            "year": year,
            "building": {"intensity": agg.i_total, "unit": UNIT},
            "category_avg": {"intensity": bench_val, "unit": UNIT}
        })
