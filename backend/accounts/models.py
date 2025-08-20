from django.db import models
from django.contrib.auth.models import User

class Institution(models.Model):
    # 기관 기본정보
    name = models.CharField(max_length=255)        # 기관명
    type = models.CharField(max_length=50)         # 기관유형 (예: 교육기관/공공기관/기업 등, 나중에 ENUM 교체)
    address = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("name", "type", "address")]  # 임시 중복방지(나중에 조정)
    def __str__(self):
        return f"{self.name}({self.type})"

class Account(models.Model):
    # Django 기본 User 확장
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="account")
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name="accounts")

    manager_name = models.CharField(max_length=100)        # 담당자 이름
    department = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=50, blank=True)  # "010-1234-5678"처럼 합쳐 저장
    # 필요 시 승인상태/역할 추가 가능
    # status = models.CharField(max_length=20, default="ACTIVE")  # PENDING/ACTIVE/REJECTED 등

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.manager_name} @ {self.institution.name}"


