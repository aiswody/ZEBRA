from django.http import JsonResponse

def index(request):
    return JsonResponse({"message": "Django API server running"})