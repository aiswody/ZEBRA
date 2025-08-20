from django.db import models
from django.db.models import Q
from accounts.models import Institution, Account

class Building(models.Model):
    class Usage(models.TextChoices):
        OFFICE = "OFFICE", "업무 시설"
        EDU_RESEARCH = "EDU_RESEARCH", "교육 연구 시설"
        CULTURE_ASSEMBLY = "CULTURE_ASSEMBLY", "문화 및 집회시설"
        MEDICAL = "MEDICAL", "의료 시설"
        TRAINING = "TRAINING", "수련 시설"
        TRANSPORT = "TRANSPORT", "운수 시설"

    class Provider(models.TextChoices):
        KAKAO = "KAKAO", "카카오"
        NAVER = "NAVER", "네이버"
        GOOGLE = "GOOGLE", "구글"
        OTHER = "OTHER", "기타/없음"

    institution = models.ForeignKey(
        Institution, on_delete=models.CASCADE, related_name="buildings"
    )
    name = models.CharField(max_length=150)                    # 최종 저장할 건물명
    usage = models.CharField(max_length=32, choices=Usage.choices)

    # 자동완성에서 받아온 세부정보(선택)
    address   = models.CharField(max_length=255, blank=True)
    latitude  = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    place_id  = models.CharField(max_length=120, blank=True)   # 외부 장소 ID(있으면 중복판정에 사용)
    provider  = models.CharField(max_length=12, choices=Provider.choices, default=Provider.OTHER)

    created_by = models.ForeignKey(
        Account, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_buildings"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    # 소프트 삭제(목록/중복판정에서 제외)
    is_archived = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            # 같은 기관에서 같은 place_id는 1개만(활성 건물 한정)
            models.UniqueConstraint(
                fields=["institution", "place_id"],
                name="uq_building_place_per_institution_active",
                condition=Q(is_archived=False) & ~Q(place_id=""),
            ),
            # place_id가 없는 경우 이름으로 1개만(활성 건물 한정)
            models.UniqueConstraint(
                fields=["institution", "name"],
                name="uq_building_name_per_institution_active",
                condition=Q(is_archived=False),
            ),
        ]
        indexes = [
            models.Index(fields=["institution", "name"]),
            models.Index(fields=["institution", "place_id"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_usage_display()})"
