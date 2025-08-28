# emissions/views_dashboard.py
import logging
from django.utils import timezone
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated  # 권장(미인증 401로 명확)
from .models import EmissionAgg
from buildings.models import Building  # 올바른 import
from .use_intensity import USE_INTENSITY, UNIT

log = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────
# 용도 표준화/매핑
# ─────────────────────────────────────────────────────────────
USE_CODE_ALIASES = {
    "업무시설": ["업무시설", "업무 시설", "사무", "사무시설"],
    "교육연구시설": ["교육연구시설", "교육 연구 시설", "교육·연구시설", "교육시설", "연구시설"],
    "문화 및 집회시설": ["문화 및 집회시설", "문화/집회", "문화및집회시설"],
    "의료시설": ["의료시설", "의료 시설", "병원"],
    "수련시설": ["수련시설", "수련 시설"],
    "운수시설": ["운수시설", "운수 시설"],
}

ENUM_TO_CANON = {
    "OFFICE": "업무시설",
    "EDU_RESEARCH": "교육연구시설",
    "CULTURE_ASSEMBLY": "문화 및 집회시설",
    "MEDICAL": "의료시설",
    "TRAINING": "수련시설",
    "TRANSPORT": "운수시설",
}

def _normalize(s: str) -> str:
    if not s:
        return ""
    return s.replace(" ", "").replace("·", "").replace("/", "")

def _lookup_intensity(use_code: str, key: str):
    """
    USE_INTENSITY에서 용도별 벤치마크(kgCO2eq/m2) 조회.
    key: 'scope1' | 'scope2' | 'total'
    """
    if not use_code:
        return None
    d = USE_INTENSITY.get(use_code)
    if d and key in d:
        return d[key]
    norm = _normalize(use_code)
    for canon, aliases in USE_CODE_ALIASES.items():
        if _normalize(canon) == norm or norm in [_normalize(x) for x in aliases]:
            dd = USE_INTENSITY.get(canon)
            if dd and key in dd:
                return dd[key]
    return None

def _extract_use_code(b: Building | None) -> str | None:
    """
    Building에서 USE_INTENSITY의 '한글 표준 키'를 추출한다.
    - 1순위: usage(enum) → ENUM_TO_CANON
    - 2순위: display 라벨 → 느슨 매칭
    """
    if not b:
        return None

    usage_enum = getattr(b, "usage", None)
    if isinstance(usage_enum, str) and usage_enum:
        canon = ENUM_TO_CANON.get(usage_enum)
        if canon:
            return canon

    try:
        label = b.get_usage_display()
    except Exception:
        label = None

    if isinstance(label, str) and label:
        norm = _normalize(label)
        for canon, aliases in USE_CODE_ALIASES.items():
            if _normalize(canon) == norm or norm in [_normalize(x) for x in aliases]:
                return canon
    return None

# ─────────────────────────────────────────────────────────────
# 공통 유틸
# ─────────────────────────────────────────────────────────────
def _safe_year(req):
    y = req.query_params.get('year')
    if not y:
        return timezone.now().year
    try:
        return int(y)
    except Exception:
        return timezone.now().year

def _zeros():
    # EmissionAgg가 없을 때 내려줄 기본값
    return {
        "scope1_solid_kg": 0, "scope1_liquid_kg": 0, "scope1_gas_kg": 0,
        "scope1_total_kg": 0, "scope2_elec_kg": 0, "total_kg": 0,
        "i_solid": 0, "i_liquid": 0, "i_gas": 0, "i_elec": 0, "i_total": 0,
        "area_m2": 0,
    }

def _get_agg(building_id, year):
    """없으면 None."""
    return (
        EmissionAgg.objects
        .filter(building_id=building_id, year=year)
        .select_related('building')
        .first()
    )

# ─────────────────────────────────────────────────────────────
# 목록/비교 (건물별)
# ─────────────────────────────────────────────────────────────
class Scope1BuildingsCompareView(APIView):
    def get(self, req):
        year = _safe_year(req)
        order = (req.query_params.get('order') or 'desc').lower()
        limit = int(req.query_params.get('limit') or 0)
        allow_all = str(req.query_params.get('allow_all', '')).lower() in ('1', 'true', 'yes')

        institution = getattr(getattr(req.user, "account", None), "institution", None)

        if institution:
            qs = (EmissionAgg.objects
                  .filter(building__institution=institution, year=year)
                  .select_related('building'))
        elif allow_all:
            qs = (EmissionAgg.objects
                  .filter(year=year)
                  .select_related('building'))
        else:
            qs = EmissionAgg.objects.none()

        qs = qs.order_by('-scope1_total_kg' if order != 'asc' else 'scope1_total_kg')
        total_count = qs.count()
        if limit > 0:
            qs = qs[:limit]

        log.warning(
            f"[SCOPE1] auth={getattr(req.user,'is_authenticated',False)} "
            f"user={getattr(req.user,'username',None)} inst_id={getattr(institution,'id',None)} "
            f"allow_all={allow_all} year={year} qs_total={total_count} returned={qs.count()}"
        )

        items = [{
            "building_id": a.building_id,
            "building_name": a.building.name,
            "solid_kg": a.scope1_solid_kg,
            "liquid_kg": a.scope1_liquid_kg,
            "gas_kg": a.scope1_gas_kg,
            "scope1_total_kg": a.scope1_total_kg
        } for a in qs]
        return Response({"year": year, "items": items})


class Scope2BuildingsCompareView(APIView):
    def get(self, req):
        year = _safe_year(req)
        order = (req.query_params.get('order') or 'desc').lower()
        limit = int(req.query_params.get('limit') or 0)
        allow_all = str(req.query_params.get('allow_all', '')).lower() in ('1', 'true', 'yes')

        institution = getattr(getattr(req.user, "account", None), "institution", None)

        if institution:
            qs = (EmissionAgg.objects
                  .filter(building__institution=institution, year=year)
                  .select_related('building'))
        elif allow_all:
            qs = (EmissionAgg.objects
                  .filter(year=year)
                  .select_related('building'))
        else:
            qs = EmissionAgg.objects.none()

        qs = qs.order_by('-scope2_elec_kg' if order != 'asc' else 'scope2_elec_kg')
        total_count = qs.count()
        if limit > 0:
            qs = qs[:limit]

        log.warning(
            f"[SCOPE2] auth={getattr(req.user,'is_authenticated',False)} "
            f"user={getattr(req.user,'username',None)} inst_id={getattr(institution,'id',None)} "
            f"allow_all={allow_all} year={year} qs_total={total_count} returned={qs.count()}"
        )

        items = [{
            "building_id": a.building_id,
            "building_name": a.building.name,
            "electricity_kg": a.scope2_elec_kg
        } for a in qs]
        return Response({"year": year, "items": items})
# ─────────────────────────────────────────────────────────────
# 요약/트렌드
# ─────────────────────────────────────────────────────────────
class ScopeRatioView(APIView):
    def get(self, req, id):
        year = _safe_year(req)
        a = _get_agg(id, year)
        if not a:
            s1 = s2 = 0.0
        else:
            s1 = float(a.scope1_total_kg or 0)
            s2 = float(a.scope2_elec_kg or 0)
        total = (s1 + s2) or 1.0
        return Response({
            "year": year,
            "scope1_kg": s1,
            "scope2_kg": s2,
            "scope1_pct": s1 / total,
            "scope2_pct": s2 / total
        })

class YearlyTrendView(APIView):
    def get(self, req, id):
        year = _safe_year(req)
        scope = req.query_params.get('scope', 'total')
        a = _get_agg(id, year)
        if not a:
            val = 0
        else:
            if scope == 'scope1':
                val = a.scope1_total_kg
            elif scope == 'scope2':
                val = a.scope2_elec_kg
            else:
                val = a.total_kg
        return Response({
            "x_axis": [str(year)],
            "series": {"periodic_total": [val or 0], "cumulative": [val or 0]},
            "unit": "kgCO2eq"
        })

class TotalTabView(APIView):
    def get(self, req, id):
        year = _safe_year(req)
        a = _get_agg(id, year)
        if not a:
            a_vals = _zeros()
        else:
            a_vals = {
                "scope1_solid_kg": a.scope1_solid_kg, "scope1_liquid_kg": a.scope1_liquid_kg,
                "scope1_gas_kg": a.scope1_gas_kg, "scope1_total_kg": a.scope1_total_kg,
                "scope2_elec_kg": a.scope2_elec_kg, "total_kg": a.total_kg,
                "i_solid": a.i_solid, "i_liquid": a.i_liquid, "i_gas": a.i_gas,
                "i_elec": a.i_elec, "i_total": a.i_total, "area_m2": a.area_m2,
            }

        user_inst = getattr(getattr(req.user, "account", None), "institution", None)
        building_inst = getattr(getattr(a, "building", None), "institution", None) if a else None
        inst_for_avg = user_inst or building_inst

        qs = (
            EmissionAgg.objects
            .filter(building__institution=inst_for_avg, year=year)
        ) if inst_for_avg else EmissionAgg.objects.none()

        sum_area = qs.aggregate(Sum('area_m2'))['area_m2__sum'] or 0
        denom = sum_area or 1
        avg = {
            "solid": float((qs.aggregate(Sum('scope1_solid_kg'))['scope1_solid_kg__sum'] or 0) / denom),
            "liquid": float((qs.aggregate(Sum('scope1_liquid_kg'))['scope1_liquid_kg__sum'] or 0) / denom),
            "gas": float((qs.aggregate(Sum('scope1_gas_kg'))['scope1_gas_kg__sum'] or 0) / denom),
            "electricity": float((qs.aggregate(Sum('scope2_elec_kg'))['scope2_elec_kg__sum'] or 0) / denom),
        }

        return Response({
            "summary": {
                "total_kg": a_vals["total_kg"],
                "scope1_kg": a_vals["scope1_total_kg"],
                "scope2_kg": a_vals["scope2_elec_kg"],
                "area_m2": a_vals["area_m2"],
                "i_total": a_vals["i_total"],
            },
            "per_area_radar": {
                "building": {
                    "solid": a_vals["i_solid"], "liquid": a_vals["i_liquid"],
                    "gas": a_vals["i_gas"], "electricity": a_vals["i_elec"]
                },
                "portfolio_avg": avg,
                "unit": "kgCO2eq/m2"
            }
        })

# ─────────────────────────────────────────────────────────────
# 용도별 평균 vs 해당 건물 — 면적당 비교
# ─────────────────────────────────────────────────────────────
class Scope1UseCompareView(APIView):
    def get(self, req, id):
        year = _safe_year(req)
        agg = _get_agg(id, year)
        if not agg:
            return Response({
                "year": year, "use_code": None,
                "building": {"intensity": 0, "unit": UNIT},
                "category_avg": {"intensity": None, "unit": UNIT}
            })
        canon = _extract_use_code(getattr(agg, "building", None))
        bench = _lookup_intensity(canon, "scope1") if canon else None
        building_val = float((agg.i_solid or 0) + (agg.i_liquid or 0) + (agg.i_gas or 0))
        return Response({
            "year": year,
            "use_code": canon,
            "building": {"intensity": building_val, "unit": UNIT},
            "category_avg": {"intensity": float(bench) if bench is not None else None, "unit": UNIT}
        })

class Scope2UseCompareView(APIView):
    def get(self, req, id):
        year = _safe_year(req)
        agg = _get_agg(id, year)
        if not agg:
            return Response({
                "year": year, "use_code": None,
                "building": {"intensity": 0, "unit": UNIT},
                "category_avg": {"intensity": None, "unit": UNIT}
            })
        canon = _extract_use_code(getattr(agg, "building", None))
        bench = _lookup_intensity(canon, "scope2") if canon else None
        building_val = float(agg.i_elec or 0)
        return Response({
            "year": year,
            "use_code": canon,
            "building": {"intensity": building_val, "unit": UNIT},
            "category_avg": {"intensity": float(bench) if bench is not None else None, "unit": UNIT}
        })

class TotalUseCompareView(APIView):
    def get(self, req, id):
        year = _safe_year(req)
        agg = _get_agg(id, year)
        if not agg:
            return Response({
                "year": year, "use_code": None,
                "building": {"intensity": 0, "unit": UNIT},
                "category_avg": {"intensity": None, "unit": UNIT}
            })
        canon = _extract_use_code(getattr(agg, "building", None))
        bench = _lookup_intensity(canon, "total") if canon else None
        building_val = float(agg.i_total or 0)
        return Response({
            "year": year,
            "use_code": canon,
            "building": {"intensity": building_val, "unit": UNIT},
            "category_avg": {"intensity": float(bench) if bench is not None else None, "unit": UNIT}
        })

# ─────────────────────────────────────────────────────────────
# Scope1 / Scope2 탭 전용 (단건)
# ─────────────────────────────────────────────────────────────
class Scope1TabView(APIView):
    def get(self, req, id):
        year = _safe_year(req)
        a = _get_agg(id, year)
        if not a:
            z = _zeros()
            return Response({
                "year": year,
                "use_code": None,
                "summary": {"scope1_total_kg": z["scope1_total_kg"]},
                "by_fuel": {
                    "solid_kg": z["scope1_solid_kg"],
                    "liquid_kg": z["scope1_liquid_kg"],
                    "gas_kg": z["scope1_gas_kg"]
                },
                "per_area": {
                    "solid": z["i_solid"], "liquid": z["i_liquid"], "gas": z["i_gas"],
                    "unit": "kgCO2eq/m2"
                }
            })
        canon = _extract_use_code(getattr(a, "building", None))
        return Response({
            "year": year,
            "use_code": canon,
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
    def get(self, req, id):
        year = _safe_year(req)
        a = _get_agg(id, year)
        if not a:
            z = _zeros()
            return Response({
                "year": year,
                "use_code": None,
                "summary": {"scope2_total_kg": z["scope2_elec_kg"]},
                "per_area": {"building": z["i_elec"], "unit": "kgCO2eq/m2"}
            })
        canon = _extract_use_code(getattr(a, "building", None))
        return Response({
            "year": year,
            "use_code": canon,
            "summary": {"scope2_total_kg": a.scope2_elec_kg},
            "per_area": {"building": a.i_elec, "unit": "kgCO2eq/m2"}
        })
