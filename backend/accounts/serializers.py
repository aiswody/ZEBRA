from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Institution, Account

class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = ("id", "name", "type", "address")

class RegisterSerializer(serializers.Serializer):
    # 기관
    institutionName = serializers.CharField()
    institutionType = serializers.CharField()
    institutionAddress = serializers.CharField(allow_blank=True, required=False)

    # 담당자
    managerName = serializers.CharField()
    department = serializers.CharField(allow_blank=True, required=False)
    email = serializers.EmailField()
    phone0 = serializers.CharField()      # "010"
    phone1 = serializers.CharField()      # "1234"
    phone2 = serializers.CharField()      # "5678"

    # 로그인용
    id = serializers.CharField(min_length=5)        # 담당자 아이디(=User.username)
    password = serializers.CharField(min_length=10) # 패스워드 규칙은 추후 강화

    def validate(self, attrs):
        # 아이디/이메일 중복 체크
        if User.objects.filter(username=attrs["id"]).exists():
            raise serializers.ValidationError({"id": "이미 사용 중인 아이디입니다."})
        if User.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "이미 사용 중인 이메일입니다."})
        return attrs

    def create(self, validated):
        # 1) 기관 찾거나 생성
        inst, _created = Institution.objects.get_or_create(
            name=validated["institutionName"].strip(),
            type=validated["institutionType"].strip(),
            address=validated.get("institutionAddress", "").strip(),
        )

        # 2) User 생성
        user = User.objects.create_user(
            username=validated["id"],
            password=validated["password"],
            email=validated["email"],
            first_name=validated["managerName"],  # 임시 매핑(원하면 Account에만 두고 여긴 공란 가능)
        )

        # 3) Account 생성
        phone = f'{validated["phone0"]}-{validated["phone1"]}-{validated["phone2"]}'
        account = Account.objects.create(
            user=user,
            institution=inst,
            manager_name=validated["managerName"],
            department=validated.get("department", ""),
            phone_number=phone,
        )

        return {
            "userId": user.id,
            "username": user.username,
            "email": user.email,
            "institution": {
                "id": inst.id,
                "name": inst.name,
                "type": inst.type,
                "address": inst.address,
            }
        }

class MeSerializer(serializers.ModelSerializer):
    # User 테이블
    id = serializers.IntegerField(source="user.id")
    username = serializers.CharField(source="user.username")
    email = serializers.EmailField(source="user.email")
    lastLoginAt = serializers.DateTimeField(source="user.last_login", allow_null=True)

    # Account 자체 필드
    managerName = serializers.CharField(source="manager_name")
    department = serializers.CharField(allow_blank=True)  # source 불필요 (같은 이름)
    phoneNumber = serializers.CharField(allow_blank=True, source="phone_number")

    # Institution
    institutionId = serializers.IntegerField(source="institution.id")
    institutionName = serializers.CharField(source="institution.name")
    institutionType = serializers.CharField(source="institution.type")
    institutionAddress = serializers.CharField(source="institution.address", allow_blank=True)

    role = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = (
            "id", "username", "email",
            "managerName", "department", "phoneNumber",
            "role", "lastLoginAt",
            "institutionId", "institutionName", "institutionType", "institutionAddress",
        )

    def get_role(self, obj):
        return getattr(obj, "role", "관리자")


