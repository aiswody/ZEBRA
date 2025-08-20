from django.db import models

class Institution(models.Model):
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=50)  # 교육기관/지자체 등

class Building(models.Model):
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    gross_area_m2 = models.FloatField(default=0)        # 연면적
    conditioned_area_m2 = models.FloatField(default=0)  # 냉난방 면적(선택)

# 정부/기관 공표 배출계수 테이블(버전관리 가능)
class EmissionFactor(models.Model):
    FUEL_CHOICES = [
        ('ELECTRICITY','전력(Scope2)'),
        ('CITY_GAS','도시가스'),
        ('LPG','LPG'),
        ('DIESEL','경유'),
        ('KEROSENE','등유'),
        ('ETC','기타'),
    ]
    scope = models.IntegerField(choices=((1,'Scope1'),(2,'Scope2')))
    fuel  = models.CharField(max_length=20, choices=FUEL_CHOICES)
    unit  = models.CharField(max_length=20)          # kWh, Nm3, L, kg ...
    co2e_per_unit = models.FloatField()              # tCO2e / unit
    co2_per_unit  = models.FloatField(default=0)     # 선택: 가스별 분해
    ch4_per_unit  = models.FloatField(default=0)
    n2o_per_unit  = models.FloatField(default=0)
    valid_from = models.DateField()
    valid_to   = models.DateField(null=True, blank=True)

# 계산 결과(월 단위 파생 테이블)
class EmissionResult(models.Model):
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    year  = models.IntegerField()
    month = models.IntegerField()

    scope1_tco2e = models.FloatField(default=0)
    scope2_tco2e = models.FloatField(default=0)
    total_tco2e  = models.FloatField(default=0)

    # 선택: GHG 분해(보고서용)
    co2_t       = models.FloatField(default=0)
    ch4_t       = models.FloatField(default=0)
    n2o_t       = models.FloatField(default=0)

    # 집약지표(대시보드용)
    intensity_total_per_m2 = models.FloatField(default=0)  # tCO2e/m2

    class Meta:
        unique_together = ('building','year','month')
