# emissions/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from activities.models import Scope1FuelUsage, ElectricityUsage, AreaInfo
from .services import recompute_and_upsert
import logging

log = logging.getLogger(__name__)

def _recompute(instance):
    try:
        b = getattr(instance, "building_id", None)
        y = getattr(instance, "year", None)
        if not b or not y:
            return
        recompute_and_upsert(int(b), int(y))
    except Exception:
        log.exception("auto recompute failed")

@receiver(post_save, sender=Scope1FuelUsage)
@receiver(post_delete, sender=Scope1FuelUsage)
def _s1_changed(sender, instance, **kwargs):
    _recompute(instance)

@receiver(post_save, sender=ElectricityUsage)
@receiver(post_delete, sender=ElectricityUsage)
def _s2_changed(sender, instance, **kwargs):
    _recompute(instance)

@receiver(post_save, sender=AreaInfo)
@receiver(post_delete, sender=AreaInfo)
def _area_changed(sender, instance, **kwargs):
    _recompute(instance)
