# reports/services.py
from __future__ import annotations

from collections import defaultdict
from random import choice
from typing import Dict, List, Tuple

from django.db.models import Sum, Q
from django.utils import timezone

from accounts.models import Account
from buildings.models import Building
from activities.models import Scope1FuelUsage, ElectricityUsage, AreaInfo, FuelCategory
from emissions.models import EmissionAgg

# ===== 설정 =====
DECIMALS = None  # None이면 DB값 그대로(반올림 안 함). 3 등으로 바꾸면 소수 3자리 반올림.

def _num(v, nd: int | None = DECIMALS) -> float:
    """Decimal/None → float (옵션 반올림)"""
    v = 0 if v is None else float(v)
    return round(v, nd) if nd is not None else v

# ===== 블록 1: 활동자료 표 (buildings_data / totals) =====
def _build_activity_block(inst, year: int) -> Tuple[List[Dict], Dict]:
    """
    결과:
      buildings_data = [{name, solid, liquid, gas, electricity}]
      totals = {solid, liquid, gas, electricity}
    단위는 DB 그대로: ton / L / m³ / kWh
    """
    bmap = {b.id: b.name for b in Building.objects.filter(institution=inst, is_archived=False).only("id", "name")}

    s1 = (
        Scope1FuelUsage.objects
        .filter(building__institution=inst, building__is_archived=False, year=year)
        .values("building_id")
        .annotate(
            solid=Sum("amount", filter=Q(category=FuelCategory.SOLID)),
            liquid=Sum("amount", filter=Q(category=FuelCategory.LIQUID)),
            gas=Sum("amount", filter=Q(category=FuelCategory.GAS)),
        )
    )
    elec = (
        ElectricityUsage.objects
        .filter(building__institution=inst, building__is_archived=False, year=year)
        .values("building_id")
        .annotate(electricity=Sum("total_kwh"))
    )

    byb = defaultdict(lambda: {"solid": 0.0, "liquid": 0.0, "gas": 0.0, "electricity": 0.0})
    for r in s1:
        m = byb[r["building_id"]]
        m["solid"] = _num(r.get("solid"))
        m["liquid"] = _num(r.get("liquid"))
        m["gas"] = _num(r.get("gas"))
    for r in elec:
        m = byb[r["building_id"]]
        m["electricity"] = _num(r.get("electricity"))

    buildings_data: List[Dict] = []
    totals = {"solid": 0.0, "liquid": 0.0, "gas": 0.0, "electricity": 0.0}
    for bid in sorted(bmap.keys(), key=lambda i: bmap[i]):
        vals = byb[bid]
        row = {
            "name": bmap[bid],
            "solid": vals["solid"],
            "liquid": vals["liquid"],
            "gas": vals["gas"],
            "electricity": vals["electricity"],
        }
        buildings_data.append(row)
        for k in totals:
            totals[k] = _num(totals[k] + row[k])

    return buildings_data, totals

# ===== 블록 2: 산정결과 표 (emission_results) =====
def _build_emission_results(inst, year: int) -> List[Dict]:
    """
    결과: [{name, scope1, scope2, total, per_area}]
    - EmissionAgg의 *_kg, total_kg, i_total(kg/m²)을 **그대로** 사용
    - i_total이 비었으면 total_kg / conditioned_area 로 보정(kg/m²)
    """
    bq = Building.objects.filter(institution=inst, is_archived=False).values("id", "name")
    bmap = {b["id"]: b["name"] for b in bq}

    # 냉난방면적(보정용)
    cond_area = {
        r["building_id"]: float(r.get("conditioned_area") or 0.0)
        for r in AreaInfo.objects.filter(building__institution=inst, year=year).values("building_id", "conditioned_area")
    }

    rows = (
        EmissionAgg.objects
        .filter(building__institution=inst, building__is_archived=False, year=year)
        .values("building_id", "scope1_total_kg", "scope2_elec_kg", "total_kg", "i_total", "area_m2")
    )

    result: List[Dict] = []
    for bid in sorted(bmap.keys(), key=lambda i: bmap[i]):
        match = next((r for r in rows if r["building_id"] == bid), None)
        if match:
            s1 = _num(match["scope1_total_kg"])
            s2 = _num(match["scope2_elec_kg"])
            tot = _num(match["total_kg"])
            per_area = _num(match["i_total"])
            if per_area == 0:
                area = float(cond_area.get(bid) or match.get("area_m2") or 0.0)
                per_area = _num(tot / area) if area > 0 else 0.0
        else:
            s1 = s2 = tot = per_area = 0.0

        result.append({
            "name": bmap[bid],
            "scope1": s1,          # kg
            "scope2": s2,          # kg
            "total": tot,          # kg
            "per_area": per_area,  # kg/m²
        })

    return result

# ===== 블록 3: 작년 총배출량 표(간소화 trend_data) =====
def _build_trend_block(inst, year: int) -> Tuple[int, List[Dict]]:
    """
    결과:
      last_year = year  (템플릿 헤더 {{ last_year - 1 }} | {{ last_year }})
      trend_data = [{name, total}]  # total=total_kg (kg)
    """
    last_year = year
    bmap = {b.id: b.name for b in Building.objects.filter(institution=inst, is_archived=False).only("id", "name")}
    rows = (
        EmissionAgg.objects
        .filter(building__institution=inst, building__is_archived=False, year=year)
        .values("building_id")
        .annotate(tot_kg=Sum("total_kg"))
    )
    totals = {r["building_id"]: _num(r["tot_kg"]) for r in rows}
    data = [{"name": bmap[bid], "total": totals.get(bid, 0.0)} for bid in sorted(bmap.keys(), key=lambda i: bmap[i])]
    return last_year, data

# ===== 블록 4: 기관/담당자/기간/요약 스칼라 =====
def _build_scalar_block(user, year: int, emission_results: List[Dict], buildings_data: List[Dict]) -> Dict:
    inst = user.account.institution
    acc: Account = user.account

    inst_total = _num(
        EmissionAgg.objects.filter(building__institution=inst, building__is_archived=False, year=year)
        .aggregate(s=Sum("total_kg"))["s"]
    )  # kg

    if emission_results:
        ex = choice(emission_results)
        ex_name, ex_total = ex["name"], ex["total"]  # kg
    else:
        ex_name, ex_total = "-", 0.0

    names = [b["name"] for b in Building.objects.filter(institution=inst, is_archived=False).values("name")]
    building_list_str = ", ".join(sorted(names)) if names else "-"

    areas = [
        float(r["gross_area"])
        for r in AreaInfo.objects.filter(building__institution=inst, year=year).values("gross_area")
        if r["gross_area"] is not None
    ]
    gross_area_min = _num(min(areas)) if areas else 0.0
    gross_area_max = _num(max(areas)) if areas else 0.0

    return {
        "institution_name": inst.name,
        "institution_type": inst.type,
        "institution_address": inst.address or "",

        "manager_name": acc.manager_name,
        "manager_dept": acc.department or "",
        "phone_number": acc.phone_number or "",

        "created_at": timezone.now().strftime("%Y-%m-%d %H:%M:%S"),
        "period_from": f"{year}-01-01",
        "period_to": f"{year}-12-31",

        "total_emission": inst_total,          # kg
        "ex_building_name": ex_name,
        "ex_building_emission": ex_total,      # kg

        "building_list_str": building_list_str,
        "gross_area_min": gross_area_min,      # m²
        "gross_area_max": gross_area_max,      # m²
    }

# ===== 메인: 컨텍스트 생성 =====
def build_tpl_ctx(user, year: int) -> Dict:
    """
    템플릿에서 참조하는 키를 그대로 채워서 반환했음 (모든 단위는 DB값 그대로)
    - buildings_data / totals
    - emission_results
    - trend_data + last_year
    - 기관/담당자/기간/요약 스칼라
    """
    inst = user.account.institution

    buildings_data, activity_totals = _build_activity_block(inst, year)
    emission_results = _build_emission_results(inst, year)
    last_year, trend_data = _build_trend_block(inst, year)
    scalars = _build_scalar_block(user, year, emission_results, buildings_data)

    ctx = {
        "buildings_data": buildings_data,   # 활동자료 표
        "totals": activity_totals,

        "emission_results": emission_results,  # 산정결과 표

        "last_year": last_year,  # 헤더 {{ last_year - 1 }} | {{ last_year }}
        "trend_data": trend_data,  # {name, total} (kg)

        **scalars,
    }
    return ctx
