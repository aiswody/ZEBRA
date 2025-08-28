# emissions/services.py
from decimal import Decimal, getcontext
from django.db import transaction
from django.db.models import DecimalField, FloatField, IntegerField
from .models import EmissionAgg
from activities.models import Scope1FuelUsage, ElectricityUsage, AreaInfo
from activities.enums import FuelCategory, Tier

getcontext().prec = 28

# ===== 상수 =====
GWP_CH4 = Decimal('28')
GWP_N2O = Decimal('265')

# 전력 배출계수 (예시)
ELEC_CO2 = Decimal('0.4517')
ELEC_CH4 = Decimal('0.0048')
ELEC_N2O = Decimal('0.0084')

# 연료별 비CO2 계수 (예시)
SOLID_CH4 = Decimal('10');   SOLID_N2O = Decimal('1.5')
LIQUID_CH4 = Decimal('10');  LIQUID_N2O = Decimal('0.6')
GAS_CH4   = Decimal('5');    GAS_N2O   = Decimal('0.1')

# 연료별 상수 A (발열량/밀도 성격)
SOLID_A = Decimal('26.7')
LIQUID_A = Decimal('35.955')
GAS_A   = Decimal('34.416')

# 산화율
OXID_SOLID   = Decimal('0.995')
OXID_LIQ_GAS = Decimal('0.99')


# ===== 유틸 =====
def _dec_or_zero(v):
    """값을 Decimal로 변환; None/에러면 0"""
    try:
        return Decimal(str(v)) if v is not None else Decimal('0')
    except Exception:
        return Decimal('0')

def _safe_div(n, d):
    d = _dec_or_zero(d)
    return Decimal('0') if d == 0 else _dec_or_zero(n) / d


# ===== Scope1: 연소 CO2eq =====
def _co2_solid(Q, tier, ef=None, cv=None):
    if tier == Tier.TIER1:
        return Q * SOLID_A * Decimal('98000') * Decimal('1.0') * Decimal('1e-6')
    if tier == Tier.TIER2:
        return Q * Decimal('19.4') * _dec_or_zero(ef) * OXID_SOLID * Decimal('1e-6')
    return Q * _dec_or_zero(cv) * _dec_or_zero(ef) * OXID_SOLID * Decimal('1e-6')

def _co2_liquid(Q, tier, ef=None, cv=None):
    if tier == Tier.TIER1:
        return Q * LIQUID_A * Decimal('73300') * Decimal('1.0') * Decimal('1e-6')
    if tier == Tier.TIER2:
        return Q * Decimal('35.87') * OXID_LIQ_GAS * Decimal('1e-6')
    return Q * _dec_or_zero(cv) * OXID_LIQ_GAS * Decimal('1e-6')

def _co2_gas(Q, tier, ef=None, cv=None):
    if tier == Tier.TIER1:
        return Q * GAS_A * Decimal('56100') * Decimal('1.0') * Decimal('1e-6')
    if tier == Tier.TIER2:
        return Q * Decimal('35.420') * OXID_LIQ_GAS * Decimal('1e-6')
    return Q * _dec_or_zero(cv) * OXID_LIQ_GAS * Decimal('1e-6')

def _ch4_n2o_common(Q, A, ch4_fac, n2o_fac):
    ch4 = Q * A * ch4_fac * Decimal('1e-6')
    n2o = Q * A * n2o_fac * Decimal('1e-6')
    return ch4, n2o


def compute_scope1_for_building_year(building_id: int, year: int):
    """Scope1(연료연소) 합계 (kgCO2eq)"""
    solid = liquid = gas = Decimal('0')

    for u in Scope1FuelUsage.objects.filter(building_id=building_id, year=year):
        # amount/ef/cv가 None이면 0 처리
        Q  = _dec_or_zero(getattr(u, 'amount', None))
        ef = _dec_or_zero(getattr(u, 'emission_factor', None))
        cv = _dec_or_zero(getattr(u, 'calorific_value', None))

        category = getattr(u, 'category', None)
        tier     = getattr(u, 'tier', Tier.TIER1)

        if category == FuelCategory.SOLID or str(category).lower() in ('solid', '고체'):
            co2 = _co2_solid(Q, tier, ef, cv)
            ch4, n2o = _ch4_n2o_common(Q, SOLID_A, SOLID_CH4, SOLID_N2O)
            solid += co2 + ch4*GWP_CH4 + n2o*GWP_N2O

        elif category == FuelCategory.LIQUID or str(category).lower() in ('liquid', '유류', '액체'):
            co2 = _co2_liquid(Q, tier, ef, cv)
            ch4, n2o = _ch4_n2o_common(Q, LIQUID_A, LIQUID_CH4, LIQUID_N2O)
            liquid += co2 + ch4*GWP_CH4 + n2o*GWP_N2O

        elif category == FuelCategory.GAS or str(category).lower() in ('gas', '가스'):
            co2 = _co2_gas(Q, tier, ef, cv)
            ch4, n2o = _ch4_n2o_common(Q, GAS_A, GAS_CH4, GAS_N2O)
            gas += co2 + ch4*GWP_CH4 + n2o*GWP_N2O

    return solid, liquid, gas, (solid + liquid + gas)


# ===== Scope2: 전력 사용량(kWh) 자동 탐지 =====
_ELEC_KWH_PRIORITY = [
    'kwh', 'consumption_kwh', 'usage_kwh', 'electricity_kwh',
    'kwh_total', 'total_kwh', 'kwh_sum'
]
_ELEC_MWH_PRIORITY = [
    'mwh', 'consumption_mwh', 'usage_mwh', 'total_mwh'
]
_EXCLUDE_NUMERIC = {'id', 'year', 'building', 'building_id', 'created_at', 'updated_at', 'modified_at'}

def _sum_electricity_kwh(building_id: int, year: int) -> Decimal:
    qs = ElectricityUsage.objects.filter(building_id=building_id, year=year)
    if not qs.exists():
        return Decimal('0')

    # 1) 우선순위 필드명 먼저 확인
    field_names = {f.name for f in ElectricityUsage._meta.get_fields() if hasattr(f, 'attname')}
    for name in _ELEC_KWH_PRIORITY:
        if name in field_names:
            return sum(_dec_or_zero(getattr(r, name, None)) for r in qs)

    # 2) MWh 필드가 있으면 kWh로 변환
    for name in _ELEC_MWH_PRIORITY:
        if name in field_names:
            total_mwh = sum(_dec_or_zero(getattr(r, name, None)) for r in qs)
            return total_mwh * Decimal('1000')

    # 3) 숫자형 필드들 중 후보 자동 선택
    numeric_fields = []
    for f in ElectricityUsage._meta.get_fields():
        if hasattr(f, 'attname') and isinstance(f, (DecimalField, FloatField, IntegerField)):
            if f.name not in _EXCLUDE_NUMERIC:
                numeric_fields.append(f.name)

    if not numeric_fields:
        return Decimal('0')

    if len(numeric_fields) == 1:
        n = numeric_fields[0]
        return sum(_dec_or_zero(getattr(r, n, None)) for r in qs)

    # 4) 여러 개면 합계가 가장 큰 필드를 선택 (경험적 폴백)
    best_sum = Decimal('0')
    for n in numeric_fields:
        s = sum(_dec_or_zero(getattr(r, n, None)) for r in qs)
        if s > best_sum:
            best_sum = s
    return best_sum


def compute_scope2_for_building_year(building_id: int, year: int):
    """Scope2(전력) 합계 (kgCO2eq)"""
    total_kwh = _sum_electricity_kwh(building_id, year)
    co2 = total_kwh * ELEC_CO2
    ch4 = total_kwh * (ELEC_CH4 / Decimal('1000'))
    n2o = total_kwh * (ELEC_N2O / Decimal('1000'))
    return co2 + ch4*GWP_CH4 + n2o*GWP_N2O


# ===== 최종 집계 =====
@transaction.atomic
def recompute_and_upsert(building_id: int, year: int):
    """
    - Scope1/2 계산 후 EmissionAgg upsert
    - 면적: AreaInfo → conditioned_area > gross_area > 0
    """
    solid, liquid, gas, s1 = compute_scope1_for_building_year(building_id, year)
    s2 = compute_scope2_for_building_year(building_id, year)
    total = s1 + s2

    area_row = (AreaInfo.objects
                .filter(building_id=building_id, year=year)
                .values('conditioned_area', 'gross_area')
                .first())
    area = Decimal('0')
    if area_row:
        area = _dec_or_zero(area_row.get('conditioned_area')) or _dec_or_zero(area_row.get('gross_area'))

    agg, _ = EmissionAgg.objects.update_or_create(
        building_id=building_id,
        year=year,
        defaults=dict(
            scope1_solid_kg=solid,
            scope1_liquid_kg=liquid,
            scope1_gas_kg=gas,
            scope1_total_kg=s1,
            scope2_elec_kg=s2,
            total_kg=total,
            area_m2=area,  # EmissionAgg 모델 필드명
            i_solid=_safe_div(solid, area),
            i_liquid=_safe_div(liquid, area),
            i_gas=_safe_div(gas, area),
            i_elec=_safe_div(s2, area),
            i_total=_safe_div(total, area),
        )
    )
    return agg
