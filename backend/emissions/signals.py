# 데이터 새로 들어오면 다시 계산하도록 트리거 발생하는 코드파일입니다
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import EnergyUsage
from .services.calculator import compute_result

@receiver(post_save, sender=EnergyUsage)
def recompute_on_change(sender, instance, **kwargs):
    compute_result(instance)

@receiver(post_delete, sender=EnergyUsage)
def clear_on_delete(sender, instance, **kwargs):
    # 삭제 시 결과도 0으로? or 레코드 삭제? 사용처에 맞게 결정
    pass