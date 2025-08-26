from decimal import Decimal, getcontext
from django.db import transaction
from .models import EmissionAgg
# 아래 import 는 네 프로젝트 실제 경로/이름에 맞춰 수정
from activities.models import Scope1FuelUsage, ElectricityUsage, AreaInfo
from buildings.models import Building
from activities.enums import FuelCategory, Tier

getcontext().prec = 28

GWP_CH4 = Decimal('28')
GWP_N2O = Decimal('265')

ELEC_CO2 = Decimal('0.4517')
ELEC_CH4 = Decimal('0.0048')
ELEC_N2O = Decimal('0.0084')

SOLID_CH4 = Decimal('10');   SOLID_N2O = Decimal('1.5')
LIQUID_CH4 = Decimal('10');  LIQUID_N2O = Decimal('0.6')
GAS_CH4 = Decimal('5');      GAS_N2O = Decimal('0.1')

SOLID_A = Decimal('26.7')
LIQUID_A = Decimal('35.955')
GAS_A   = Decimal('34.416')

OXID_SOLID = Decimal('0.995')
OXID_LIQ_GAS = Decimal('0.99')

def _co2_solid(Q, tier, ef=None, cv=None):
    if tier == Tier.TIER1:
        return Q * SOLID_A * Decimal('98000') * Decimal('1.0') * Decimal('1e-6')
    if tier == Tier.TIER2:
        return Q * Decimal('19.4') * ef * OXID_SOLID * Decimal('1e-6')
    return Q * cv * ef * OXID_SOLID * Decimal('1e-6')

def _co2_liquid(Q, tier, ef=None, cv=None):
    if tier == Tier.TIER1:
        return Q * LIQUID_A * Decimal('73300') * Decimal('1.0') * Decimal('1e-6')
    if tier == Tier.TIER2:
        return Q * Decimal('35.87') * OXID_LIQ_GAS * Decimal('1e-6')
    return Q * cv * OXID_LIQ_GAS * Decimal('1e-6')

def _co2_gas(Q, tier, ef=None, cv=None):
    if tier == Tier.TIER1:
        return Q * GAS_A * Decimal('56100') * Decimal('1.0') * Decimal('1e-6')
    if tier == Tier.TIER2:
        return Q * Decimal('35.420') * OXID_LIQ_GAS * Decimal('1e-6')
    return Q * cv * OXID_LIQ_GAS * Decimal('1e-6')

def _ch4_n2o_common(Q, A, ch4_fac, n2o_fac):
    ch4 = Q * A * ch4_fac * Decimal('1e-6')
    n2o = Q * A * n2o_fac * Decimal('1e-6')
    return ch4, n2o

def compute_scope1_for_building_year(building_id: int, year: int):
    from activities.models import Scope1FuelUsage
    solid = liquid = gas = Decimal('0')
    for u in Scope1FuelUsage.objects.filter(building_id=building_id, year=year):
        Q  = Decimal(u.amount)
        ef = Decimal(u.emission_factor) if u.emission_factor is not None else None
        cv = Decimal(u.calorific_value) if u.calorific_value is not None else None

        if u.category == FuelCategory.SOLID:
            co2 = _co2_solid(Q, u.tier, ef, cv)
            ch4, n2o = _ch4_n2o_common(Q, SOLID_A, SOLID_CH4, SOLID_N2O)
            solid += co2 + ch4*GWP_CH4 + n2o*GWP_N2O
        elif u.category == FuelCategory.LIQUID:
            co2 = _co2_liquid(Q, u.tier, ef, cv)
            ch4, n2o = _ch4_n2o_common(Q, LIQUID_A, LIQUID_CH4, LIQUID_N2O)
            liquid += co2 + ch4*GWP_CH4 + n2o*GWP_N2O
        elif u.category == FuelCategory.GAS:
            co2 = _co2_gas(Q, u.tier, ef, cv)
            ch4, n2o = _ch4_n2o_common(Q, GAS_A, GAS_CH4, GAS_N2O)
            gas += co2 + ch4*GWP_CH4 + n2o*GWP_N2O
    return solid, liquid, gas, (solid+liquid+gas)

def compute_scope2_for_building_year(building_id: int, year: int):
    from activities.models import ElectricityUsage
    total_kwh = sum(Decimal(r.kwh) for r in ElectricityUsage.objects.filter(building_id=building_id, year=year))
    co2 = total_kwh * ELEC_CO2
    ch4 = total_kwh * ELEC_CH4
    n2o = total_kwh * ELEC_N2O
    return co2 + ch4*GWP_CH4 + n2o*GWP_N2O

def _safe_div(n, d):
    d = Decimal(d)
    return Decimal('0') if d == 0 else Decimal(n)/d

@transaction.atomic
def recompute_and_upsert(building_id: int, year: int):
    from activities.models import AreaInfo
    solid, liquid, gas, s1 = compute_scope1_for_building_year(building_id, year)
    s2 = compute_scope2_for_building_year(building_id, year)
    total = s1 + s2
    area = AreaInfo.objects.filter(building_id=building_id, year=year).values_list('area_m2', flat=True).first() or Decimal('0')

    agg, _ = EmissionAgg.objects.update_or_create(
        building_id=building_id, year=year,
        defaults=dict(
            scope1_solid_kg=solid,
            scope1_liquid_kg=liquid,
            scope1_gas_kg=gas,
            scope1_total_kg=s1,
            scope2_elec_kg=s2,
            total_kg=total,
            area_m2=area,
            i_solid=_safe_div(solid, area),
            i_liquid=_safe_div(liquid, area),
            i_gas=_safe_div(gas, area),
            i_elec=_safe_div(s2, area),
            i_total=_safe_div(total, area),
        )
    )
    return agg
