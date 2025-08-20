# buildings/serializers.py
from rest_framework import serializers
from django.db.models import Q
from .models import Building

class BuildingCreateSerializer(serializers.ModelSerializer):
    # 프론트 호환용 별칭(쓰기 전용) → 모델 필드로 매핑
    use_type = serializers.ChoiceField(
        choices=Building.Usage.choices,
        source="usage",
        write_only=True,
        required=False,
    )
    lat = serializers.FloatField(
        source="latitude",
        write_only=True,
        required=False,
        allow_null=True,
    )
    lng = serializers.FloatField(
        source="longitude",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Building
        fields = (
            "id",
            "name",
            # 읽기 전용으로 포함: 생성 응답 시 사용자가 선택한 코드 확인 가능
            "usage",
            # 프론트 입력 별칭
            "use_type",
            "address",
            "lat",
            "lng",
            "place_id",
            "provider",
        )
        read_only_fields = ("id", "usage")

    def validate(self, attrs):
        request = self.context["request"]

        # 사용자 → 계정 → 기관 구조 가정(질문자가 준 코드 유지)
        try:
            inst = request.user.account.institution
        except Exception:
            raise serializers.ValidationError(
                {"institution": "사용자 계정에 기관이 연결되어 있지 않습니다."}
            )

        name = (attrs.get("name") or "").strip()
        place_id = (attrs.get("place_id") or "").strip()

        if not name:
            raise serializers.ValidationError({"name": "건물명을 입력하세요."})

        qs_active = Building.objects.filter(institution=inst, is_archived=False)

        # place_id가 있으면 최우선 중복 판정
        if place_id:
            if qs_active.filter(~Q(place_id=""), place_id=place_id).exists():
                raise serializers.ValidationError({"place_id": "이미 이 기관에 등록된 장소입니다."})
        else:
            if qs_active.filter(name=name).exists():
                raise serializers.ValidationError({"name": "이미 이 기관에 같은 이름의 건물이 있습니다."})

        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        user = request.user
        inst = user.account.institution

        place_id = (validated_data.get("place_id") or "").strip()
        name = (validated_data.get("name") or "").strip()

        # 과거 아카이브 항목 복구 우선
        qs_archived = Building.objects.filter(institution=inst, is_archived=True)
        prev = (
            qs_archived.filter(place_id=place_id).first()
            if place_id
            else qs_archived.filter(name=name).first()
        )

        if prev:
            for k, v in validated_data.items():
                setattr(prev, k, v)
            prev.institution = inst
            prev.created_by = getattr(user, "account", None)
            prev.is_archived = False
            prev.save()
            return prev

        return Building.objects.create(
            institution=inst,
            created_by=getattr(user, "account", None),
            **validated_data,
        )


class BuildingListSerializer(serializers.ModelSerializer):
    usageLabel = serializers.CharField(source="get_usage_display", read_only=True)
    providerLabel = serializers.CharField(source="get_provider_display", read_only=True)
    institutionName = serializers.SerializerMethodField(read_only=True)
    # 프론트 표시 편의: lat/lng 별칭으로 내보내기
    lat = serializers.FloatField(source="latitude", read_only=True)
    lng = serializers.FloatField(source="longitude", read_only=True)

    class Meta:
        model = Building
        fields = (
            "id",
            "name",
            "usage",
            "usageLabel",
            "address",
            "lat",
            "lng",
            "place_id",
            "provider",
            "providerLabel",
            "institutionName",
            "created_at",
        )

    def get_institutionName(self, obj):
        return getattr(obj.institution, "name", str(obj.institution))
