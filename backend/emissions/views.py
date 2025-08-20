from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Avg
from .models import EnergyUsage, EmissionResult, Building
from .serializers import EnergyUsageSerializer, EmissionResultSerializer

class EnergyUsageViewSet(viewsets.ModelViewSet):
    queryset = EnergyUsage.objects.all()
    serializer_class = EnergyUsageSerializer
    permission_classes = [permissions.IsAuthenticated]

class EmissionResultViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EmissionResult.objects.all()
    serializer_class = EmissionResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    # /api/emissions/buildings/{id}/yearly?year=2024
    @action(detail=False, methods=['get'], url_path='buildings/(?P<bid>[^/.]+)/yearly')
    def building_yearly(self, request, bid):
        year = int(request.query_params.get('year'))
        qs = EmissionResult.objects.filter(building_id=bid, year=year)\
             .values('month').order_by('month')\
             .annotate(scope1=Sum('scope1_tco2e'),
                       scope2=Sum('scope2_tco2e'),
                       total=Sum('total_tco2e'))
        return Response(qs)

    # /api/emissions/compare?building_id=1&year=2024
    # 해당 건물 vs 기관 평균
    @action(detail=False, methods=['get'])
    def compare(self, request):
        bid  = int(request.query_params['building_id'])
        year = int(request.query_params['year'])
        b = Building.objects.select_related('institution').get(id=bid)

        mine = EmissionResult.objects.filter(building=b, year=year)\
            .aggregate(total=Sum('total_tco2e'), intensity=Avg('intensity_total_per_m2'))

        inst_avg = EmissionResult.objects.filter(
            building__institution=b.institution, year=year
        ).aggregate(total=Avg('total_tco2e'), intensity=Avg('intensity_total_per_m2'))

        return Response({'mine': mine, 'institution_avg': inst_avg})

    # /api/emissions/scope-share?building_id=1&year=2024
    @action(detail=False, methods=['get'])
    def scope_share(self, request):
        bid  = int(request.query_params['building_id'])
        year = int(request.query_params['year'])
        agg = EmissionResult.objects.filter(building_id=bid, year=year)\
            .aggregate(s1=Sum('scope1_tco2e'), s2=Sum('scope2_tco2e'))
        total = (agg['s1'] or 0) + (agg['s2'] or 0)
        share = {
            'scope1_pct': round((agg['s1'] or 0)/total*100, 1) if total else 0,
            'scope2_pct': round((agg['s2'] or 0)/total*100, 1) if total else 0,
        }
        return Response({'sum': agg, 'share': share})