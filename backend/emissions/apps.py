# emissions/apps.py
from django.apps import AppConfig

class EmissionsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "emissions"

    def ready(self):
        # 신호 연결 보장
        import emissions.signals  # noqa
