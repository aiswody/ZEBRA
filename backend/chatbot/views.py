# backend/chatbot/views.py

import json
import os
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist

# --- [수정됨] ---
# rest_framework의 데코레이터와 인증 클래스를 import 합니다.
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from accounts.models import Account
from buildings.models import Building
from emissions.models import EmissionAgg
from .services import get_deepseek_recommendation, AIConnectionError

# --- [수정됨] ---
# @login_required 대신, 다른 API들과 동일한 JWT 인증 방식을 사용하도록 변경합니다.
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_recommendation_api(request):
    """
    로그인된 사용자의 기관 데이터를 기반으로
    AI 모델에게 온실가스 감축 방안을 요청하고 응답을 반환하는 API 뷰
    """
    try:
        # 이제 request.user는 JWT 토큰을 통해 인증된 사용자입니다.
        institution = request.user.account.institution
        buildings = Building.objects.filter(institution=institution, is_archived=False)
        
        if not buildings.exists():
            return JsonResponse({'error': '기관에 등록된 건물이 없습니다. 먼저 데이터를 등록해주세요.'}, status=404)

        building_data_for_prompt = []
        for building in buildings:
            building_info = {
                'name': building.name,
                'usage': building.get_usage_display(),
                'address': building.address,
                'emissions': None
            }
            latest_emission = EmissionAgg.objects.filter(building=building).order_by('-year').first()
            if latest_emission:
                building_info['emissions'] = {
                    'year': latest_emission.year,
                    'total_emissions_kg': float(latest_emission.total_kg),
                    'scope1_emissions_kg': float(latest_emission.scope1_total_kg),
                    'scope2_electricity_emissions_kg': float(latest_emission.scope2_elec_kg),
                    'emissions_per_area_kg_m2': float(latest_emission.i_total)
                }
            building_data_for_prompt.append(building_info)

        recommendation = get_deepseek_recommendation(institution, building_data_for_prompt)
        
        return JsonResponse({'recommendation': recommendation})

    except Account.DoesNotExist:
        return JsonResponse({'error': '사용자 계정 프로필을 찾을 수 없습니다.'}, status=404)
    except AIConnectionError as e:
        return JsonResponse({'error': str(e)}, status=500)
    except Exception as e:
        print(f"Error in get_recommendation_api: {e}") 
        return JsonResponse({'error': f'서버 내부 오류가 발생했습니다: {str(e)}'}, status=500)
