# reports/urls.py

from django.urls import path
from .views import ReportLiveView, ReportDocxDownloadLiveView

urlpatterns = [
    path("context", ReportLiveView.as_view(), name="report-context"),
    path("download", ReportDocxDownloadLiveView.as_view(), name="report-docx-download"),
]