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
    path('chatbot/', include('chatbot.urls')),
    path('api/', include('emissions.urls')), 
    path('api/reports/', include('reports.urls')),

    # 위에서 정의한 모든 URL을 제외한 나머지 모든 경로를 React 앱으로 연결합니다.
    # 이 규칙이 반드시 맨 마지막에 와야 합니다!
    re_path(r'^.*$', index, name='index'),    
]


