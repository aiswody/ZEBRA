# reports/views.py
from __future__ import annotations

from io import BytesIO
from django.utils import timezone
from django.http import FileResponse
from django.core.exceptions import ValidationError

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication 

from .services import build_tpl_ctx
from .utils import render_docx  # BytesIO 반환 필수



# ──────────────────────────────────────────────────────────────
# year 쿼리파라미터 안전 파싱 (없으면 '작년', 미래/이상치 차단)
# ──────────────────────────────────────────────────────────────
def _get_year(request) -> int:
    now_y = timezone.now().year
    default = now_y - 1
    raw = request.query_params.get("year")
    if raw is None or str(raw).strip() == "":
        return default
    try:
        y = int(raw)
    except (TypeError, ValueError):
        raise ValidationError("year는 정수여야 합니다. 예: 2024")
    if y < 1900 or y > now_y:
        raise ValidationError(f"year는 1900~{now_y} 사이여야 합니다.")
    return y


# ──────────────────────────────────────────────────────────────
# 남용 방지 스로틀: 사용자 기준 시간당 20회
# ──────────────────────────────────────────────────────────────
class ReportThrottle(UserRateThrottle):
    rate = "20/hour"


# ──────────────────────────────────────────────────────────────
# 컨텍스트 JSON 확인 (프론트/QA용)
# GET /api/reports/context?year=2024
# ──────────────────────────────────────────────────────────────
class ReportLiveView(APIView):
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated]
    throttle_classes = [ReportThrottle]

    def get(self, request):
        if not hasattr(request.user, "account"):
            return Response({"detail": "사용자에 account가 없습니다."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            year = _get_year(request)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        ctx = build_tpl_ctx(request.user, year)
        return Response({"year": year, "context": ctx}, status=status.HTTP_200_OK)


# ──────────────────────────────────────────────────────────────
# DOCX 다운로드
# GET /api/reports/download?year=2024
# ──────────────────────────────────────────────────────────────
class ReportDocxDownloadLiveView(APIView):
    authentication_classes = [JWTAuthentication, SessionAuthentication] 
    permission_classes = [IsAuthenticated]
    throttle_classes = [ReportThrottle]

    def get(self, request):
        if not hasattr(request.user, "account"):
            return Response({"detail": "사용자에 account가 없습니다."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            year = _get_year(request)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        ctx = build_tpl_ctx(request.user, year)

        # 데이터가 전혀 없으면 204 (선택)
        if not ctx.get("emission_results") and not ctx.get("buildings_data"):
            return Response(status=status.HTTP_204_NO_CONTENT)

        try:
            buf: BytesIO = render_docx(ctx)  # BytesIO여야 함
            if hasattr(buf, "seek"):
                buf.seek(0)
        except Exception as e:
            return Response({"detail": f"DOCX 렌더 중 오류: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        filename = f"보고서_{year}.docx"
        return FileResponse(
            buf,
            as_attachment=True,
            filename=filename,
            content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
