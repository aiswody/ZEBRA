from django.shortcuts import render

def index(request):
    """
    모든 non-API 요청을 React의 index.html로 렌더링합니다.
    """
    return render(request, 'index.html')