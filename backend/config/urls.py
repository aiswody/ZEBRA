from django.contrib import admin
from django.urls import path, include, re_path
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

from .views import index

schema_view = get_schema_view(
   openapi.Info(title="GHG API", default_version='v1', description=""),
   public=True, permission_classes=(permissions.AllowAny,)
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),  
    path('api/', include('buildings.urls')),
    path("api/activities/", include("activities.urls")), 
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='swagger-ui'),
    
    # --- [수정됨] ---
    # 챗봇 API의 경로를 다른 API들과 동일하게 /api/ 하위로 변경합니다.
    path('api/chatbot/', include('chatbot.urls')),
    
    path('api/', include('emissions.urls')), 
    path('api/reports/', include('reports.urls')),
]
