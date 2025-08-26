from rest_framework import serializers
from django.db import transaction
from decimal import Decimal
from .models import (
    Scope1FuelUsage,
    ElectricityUsage,
    AreaInfo,
    FuelDefaultCoeff,
    FuelCategory,
    Tier,
)
from buildings.models import Building


# ---------- 입력용 Payload ----------

class Scope1FuelPayloadSerializer(serializers.Serializer):
    tier = serializers.ChoiceField(choices=Tier.choices)
    unit = serializers.CharField()
    amounts = serializers.ListField(
        child=serializers.DecimalField(max_digits=18, decimal_places=6),
        allow_empty=True,
    )
    emission_factor = serializers.DecimalField(
        max_digits=18, decimal_places=6, required=False
    )
    calorific_value = serializers.DecimalField(
        max_digits=18, decimal_places=6, required=False
    )


class AreaPayloadSerializer(serializers.Serializer):
    # 우리 웹 UI에 맞춰 2개만 사용
    gross = serializers.DecimalField(max_digits=18, decimal_places=2, required=False)        # 연면적
    conditioned = serializers.DecimalField(max_digits=18, decimal_places=2, required=False)  # 냉난방면적


class ActivitiesSubmitSerializer(serializers.Serializer):
    year = serializers.IntegerField()
    scope1 = serializers.DictField(child=Scope1FuelPayloadSerializer(), required=False)
    scope2 = serializers.DictField(required=False)
    areas = AreaPayloadSerializer(required=False)

    def validate(self, attrs):
        s1 = attrs.get("scope1", {})

        def rule(category_key, need_ef=False, need_cv=False):
            data = s1.get(category_key)
            if not data:
                return
            tier = int(data["tier"])
            if tier == Tier.T1:
                return
            if tier == Tier.T2:
                if need_ef and "emission_factor" not in data:
                    raise serializers.ValidationError(
                        {category_key: "Tier2는 배출계수를 입력해야 합니다."}
                    )
            if tier == Tier.T3:
                if need_ef and "emission_factor" not in data:
                    raise serializers.ValidationError(
                        {category_key: "Tier3는 배출계수를 입력해야 합니다."}
                    )
                if need_cv and "calorific_value" not in data:
                    raise serializers.ValidationError(
                        {category_key: "Tier3는 열량계수를 입력해야 합니다."}
                    )

        # 요구사항 매핑
        rule("solid", need_ef=True, need_cv=True)   # 고체: T2=EF, T3=EF+CV
        rule("liquid", need_ef=False, need_cv=True) # 액체: T3=CV
        rule("gas", need_ef=False, need_cv=True)    # 기체: T3=CV
        return attrs

    @transaction.atomic
    def create(self, validated):
        building: Building = self.context["building"]
        year = validated["year"]

        # --- Scope1 (카테고리별 합계 저장) ---
        s1 = validated.get("scope1", {})
        for key, category in [
            ("solid", FuelCategory.SOLID),
            ("liquid", FuelCategory.LIQUID),
            ("gas", FuelCategory.GAS),
        ]:
            data = s1.get(key)
            if not data:
                Scope1FuelUsage.objects.filter(
                    building=building, year=year, category=category
                ).delete()
                continue

            tier = int(data["tier"])
            unit = data["unit"]
            raw_amounts = data.get("amounts", [])
            amount = (
                sum(Decimal(str(x)) for x in raw_amounts)
                if raw_amounts
                else Decimal("0")
            )

            ef = data.get("emission_factor")
            cv = data.get("calorific_value")

            # Tier1 기본계수 자동 주입(있을 때만)
            if tier == Tier.T1:
                try:
                    base = FuelDefaultCoeff.objects.get(category=category)
                    if base.default_emission_factor is not None:
                        ef = base.default_emission_factor
                    if base.default_calorific_value is not None:
                        cv = base.default_calorific_value
                except FuelDefaultCoeff.DoesNotExist:
                    pass

            Scope1FuelUsage.objects.update_or_create(
                building=building,
                year=year,
                category=category,
                defaults=dict(
                    tier=tier,
                    unit=unit,
                    amount=amount,
                    emission_factor=ef,
                    calorific_value=cv,
                ),
            )

        # --- Scope2 (전기 kWh 합계) ---
        s2 = validated.get("scope2", {})
        elec = s2.get("electricity") if s2 else None
        if elec and "kwhs" in elec:
            total_kwh = sum(Decimal(str(x)) for x in elec.get("kwhs", []))
            ElectricityUsage.objects.update_or_create(
                building=building, year=year, defaults=dict(total_kwh=total_kwh)
            )
        else:
            ElectricityUsage.objects.filter(building=building, year=year).delete()

        # --- 면적 (연면적/냉난방면적만) ---
        areas = validated.get("areas", None)
        if areas is not None:
            AreaInfo.objects.update_or_create(
                building=building,
                year=year,
                defaults=dict(
                    gross_area=areas.get("gross"),
                    conditioned_area=areas.get("conditioned"),
                ),
            )
        else:
            AreaInfo.objects.filter(building=building, year=year).delete()

        return {"buildingId": building.id, "year": year, "saved": True}


# ---------- 조회용(상세/요약) ----------

class Scope1CategoryOutSerializer(serializers.Serializer):
    tier = serializers.IntegerField()
    unit = serializers.CharField()
    amounts = serializers.ListField(child=serializers.DecimalField(max_digits=18, decimal_places=6))
    emission_factor = serializers.DecimalField(max_digits=18, decimal_places=6, required=False, allow_null=True)
    calorific_value = serializers.DecimalField(max_digits=18, decimal_places=6, required=False, allow_null=True)


class ActivitiesDetailOutSerializer(serializers.Serializer):
    buildingId = serializers.IntegerField()
    buildingName = serializers.CharField()
    year = serializers.IntegerField()
    scope1 = serializers.DictField(child=Scope1CategoryOutSerializer(), required=False)
    scope2 = serializers.DictField(required=False)
    areas = AreaPayloadSerializer(required=False)


class ActivitiesSummaryItemSerializer(serializers.Serializer):
    buildingId = serializers.IntegerField()
    buildingName = serializers.CharField()
    year = serializers.IntegerField()
    solid_amount = serializers.DecimalField(max_digits=20, decimal_places=6, required=False)
    liquid_amount = serializers.DecimalField(max_digits=20, decimal_places=6, required=False)
    gas_amount = serializers.DecimalField(max_digits=20, decimal_places=6, required=False)
    total_kwh = serializers.DecimalField(max_digits=20, decimal_places=6, required=False)
    gross_area = serializers.DecimalField(max_digits=18, decimal_places=2, required=False)
    conditioned_area = serializers.DecimalField(max_digits=18, decimal_places=2, required=False)