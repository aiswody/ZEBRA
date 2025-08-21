from django.db import models
from django.core.validators import MinValueValidator
from buildings.models import Building

class FuelCategory(models.TextChoices):
    SOLID  = "SOLID",  "고체"
    LIQUID = "LIQUID", "액체"
    GAS    = "GAS",    "기체"

class Tier(models.IntegerChoices):
    T1 = 1
    T2 = 2
    T3 = 3

class Scope1FuelUsage(models.Model):
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name="scope1_usages")
    year     = models.IntegerField()
    category = models.CharField(max_length=10, choices=FuelCategory.choices)
    tier     = models.IntegerField(choices=Tier.choices)

    amount   = models.DecimalField(max_digits=18, decimal_places=6, validators=[MinValueValidator(0)])
    unit     = models.CharField(max_length=10)

    # kgGHG/TJ (고체 T2/T3)
    emission_factor = models.DecimalField(max_digits=18, decimal_places=6, null=True, blank=True)
    # MJ/unit (고체/액체/기체 T3)
    calorific_value = models.DecimalField(max_digits=18, decimal_places=6, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("building", "year", "category")

class ElectricityUsage(models.Model):
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name="electricity_usages")
    year     = models.IntegerField()
    total_kwh = models.DecimalField(max_digits=20, decimal_places=6, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("building", "year")

class AreaInfo(models.Model):
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name="area_infos")
    year     = models.IntegerField()
    # ✔ 우리 웹에 맞춰 2개만 유지
    gross_area       = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)       # 연면적
    conditioned_area = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)       # 냉난방면적
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("building", "year")

class FuelDefaultCoeff(models.Model):
    category = models.CharField(max_length=10, choices=FuelCategory.choices, unique=True)
    default_emission_factor = models.DecimalField(max_digits=18, decimal_places=6, null=True, blank=True)  # kgGHG/TJ
    default_calorific_value = models.DecimalField(max_digits=18, decimal_places=6, null=True, blank=True)  # MJ/unit
    note = models.CharField(max_length=255, blank=True, default="")
