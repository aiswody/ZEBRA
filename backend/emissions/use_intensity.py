# emissions/use_intensity.py
from decimal import Decimal

UNIT = "kgCO2eq/m2"

# 건물용도 값은 Building.use_code 와 "완전히 동일"해야 함
USE_INTENSITY = {
    # 예시 값(임시). 엑셀에서 계산한 18개 수치로 교체하세요.
    "업무시설":      {"scope1": Decimal("0.000954"), "scope2": Decimal("0.018886"), "total": Decimal("0.019840")},
    "교육연구시설":  {"scope1": Decimal("0.000574"), "scope2": Decimal("0.009935"), "total": Decimal("0.010509")},
    "문화 및 집회시설": {"scope1": Decimal("0.000536"), "scope2": Decimal("0.045541"), "total": Decimal("0.046077")},
    "의료시설":      {"scope1": Decimal("0.001354"), "scope2": Decimal("0.006254"), "total": Decimal("0.007608")},
    "수련시설":      {"scope1": Decimal("0.001409"), "scope2": Decimal("0.007112"), "total": Decimal("0.008521")},
    "운수시설":      {"scope1": Decimal("0.000148"), "scope2": Decimal("0.005560"), "total": Decimal("0.005708")},
}

# RAW_DATA는 공공데이터에서 계산한 용도 별 온실가스 배출량입니다
# 현재 시간이 촉박한 관계로 공공데이터의 계산된 값(USE_INTENSITY)를 가지고 용도 별 그래프 비교를 진행하기로 하였습니다
# 각 용도 별 배출량 합 / 각 용도 별 냉난방면적 총합 (가중치를 고려한 공식)
# 여기서 각 용도 별 배출량 합은 Scope1, Scope2, Total을 의미
# (각 용도 별 Scope1 값의 총 합  /  각 용도 별 냉난방면적 총 합) , (각 용도 별 Scope2 값의 총 합  /  각 용도 별 냉난방면적 총 합), (각 용도 별 Total 값의 총 합  /  각 용도 별 냉난방면적 총 합)
# 새로운 데이터가 들어오면 용도에 맞게 분자 분모에 해당하는 데이터를 더하면 됩니다
#_nom : 분자, _denorm : 분모


RAW_DATA = {
    "업무시설":      {"scope1_nom": Decimal("10989.851640"), "scope1_denom": Decimal("1.151800e+07"),"scope2_nom": Decimal("217527.786544"),"scope2_denom": Decimal("1.151800e+07"), "total_nom": Decimal("228517.638183")},"total_denom": Decimal("1.151800e+07"),
    "교육연구시설":  {"scope1_nom": Decimal("5297.136624"), "scope1_denom": Decimal("9.229546e+06"),"scope2_nom": Decimal("91694.687124"),"scope2_denom": Decimal("9.229546e+06"), "total_nom": Decimal("96991.823749")},"total_denom": Decimal("9.229546e+06"),
    "문화 및 집회시설":  {"scope1_nom": Decimal("2774.867281"), "scope1_denom": Decimal("5.177704e+06"),"scope2_nom": Decimal("235799.133472"),"scope2_denom": Decimal("5.177704e+06"), "total_nom": Decimal("238574.000754")},"total_denom": Decimal("5.177704e+06"),
    "의료시설":      {"scope1_nom": Decimal("3246.042228"), "scope1_denom": Decimal("2.397784e+06"),"scope2_nom": Decimal("14995.311374"),"scope2_denom": Decimal("2.397784e+06"), "total_nom": Decimal("18241.353602")},"total_denom": Decimal("2.397784e+06"),
    "수련시설":      {"scope1_nom": Decimal("927.651099"), "scope1_denom": Decimal("6.584503e+05"),"scope2_nom": Decimal("4682.775245"),"scope2_denom": Decimal("6.584503e+05"), "total_nom": Decimal("5610.426345")},"total_denom": Decimal("6.584503e+05"),
    "운수시설":     {"scope1_nom": Decimal("308.801655"), "scope1_denom": Decimal("2.088842e+06"),"scope2_nom": Decimal("11614.605863"),"scope2_denom": Decimal("2.088842e+06"), "total_nom": Decimal("11923.407518")},"total_denom": Decimal("2.088842e+06"),
}