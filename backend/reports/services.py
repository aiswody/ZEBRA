# reports/services.py
from datetime import date
from typing import Dict, Any, List
from django.utils.timezone import now
from django.db.models import Sum

from accounts.models import Institution, Account
from buildings.models import Building
from emissions.models import EmissionAgg


def build_period(year: int) -> Dict[str, str]:
    return {
        "period_label": f"{year}년",
        "date_from": date(year, 1, 1).isoformat(),
        "date_to": date(year, 12, 31).isoformat(),
        "generated_at": now().isoformat(),
    }


def build_institution_context(institution: Institution) -> Dict[str, Any]:
    # 대표 담당자 1명만 단순 노출(규칙은 팀 내 정책에 맞춰 수정 가능)
    account = Account.objects.filter(institution=institution).order_by("id").first()
    return {
        "institution_id": institution.id,
        "institution_name": getattr(institution, "name", ""),
        "institution_type": getattr(institution, "type", ""),  # 기관용도
        "manager_name": getattr(account, "name", "") if account else "",
        "department": getattr(account, "department", "") if account else "",
        "contact": getattr(account, "phone", "") if account else "",
        "hq_address": getattr(account, "address", "") if account else "",
    }


def list_buildings(institution: Institution) -> List[Dict[str, Any]]:
    # EmissionAgg.area_m2 를 기준 정보로 쓰지만, 건물의 이름은 Building에서 가져옴
    qs = (Building.objects
          .filter(institution=institution)
          .only("id", "name", "gross_area", "use_code"))
    return [{
        "building_id": b.id,
        "building_name": b.name,
        "gross_area_m2": b.gross_area,     # 원본 그대로 노출(재계산 X)
        "use_code": getattr(b, "use_code", None),
    } for b in qs]


def sum_institution_emissions(year: int, institution: Institution) -> Dict[str, Any]:
    """기관 단위 합계를 EmissionAgg 합산으로만 생성(재계산 없음)"""
    base = EmissionAgg.objects.filter(building__institution=institution, year=year)

    agg = base.aggregate(
        scope1_solid_kg=Sum("scope1_solid_kg"),
        scope1_liquid_kg=Sum("scope1_liquid_kg"),
        scope1_gas_kg=Sum("scope1_gas_kg"),
        scope1_total_kg=Sum("scope1_total_kg"),
        scope2_elec_kg=Sum("scope2_elec_kg"),
        total_kg=Sum("total_kg"),
        area_m2=Sum("area_m2"),
        i_solid=Sum("i_solid"),    # 주의: 면적당 지표는 단순합이 의미 없을 수 있음. 그대로 노출만.
        i_liquid=Sum("i_liquid"),
        i_gas=Sum("i_gas"),
        i_elec=Sum("i_elec"),
        i_total=Sum("i_total"),
    )
    return {k: agg.get(k) or 0 for k in agg}


def list_building_emissions(year: int, institution: Institution) -> List[Dict[str, Any]]:
    """건물별 EmissionAgg 행을 그대로 나열"""
    qs = (EmissionAgg.objects
          .filter(building__institution=institution, year=year)
          .select_related("building")
          .only("building_id", "scope1_solid_kg", "scope1_liquid_kg", "scope1_gas_kg",
                "scope1_total_kg", "scope2_elec_kg", "total_kg",
                "area_m2", "i_solid", "i_liquid", "i_gas", "i_elec", "i_total"))
    items = []
    for a in qs:
        items.append({
            "building_id": a.building_id,
            "building_name": a.building.name,
            "scope1_solid_kg": a.scope1_solid_kg,
            "scope1_liquid_kg": a.scope1_liquid_kg,
            "scope1_gas_kg": a.scope1_gas_kg,
            "scope1_total_kg": a.scope1_total_kg,
            "scope2_elec_kg": a.scope2_elec_kg,
            "total_kg": a.total_kg,
            "area_m2": a.area_m2,
            "i_solid": a.i_solid,
            "i_liquid": a.i_liquid,
            "i_gas": a.i_gas,
            "i_elec": a.i_elec,
            "i_total": a.i_total,
        })
    return items


def build_report_json(year: int, institution: Institution) -> Dict[str, Any]:
    """보고서 JSON 한방 응답(모두 '읽기'만)"""
    return {
        "meta": build_period(year),
        "institution": build_institution_context(institution),
        "buildings": list_buildings(institution),
        "emissions": {
            "summary": sum_institution_emissions(year, institution),
            "by_building": list_building_emissions(year, institution),
        }
    }
