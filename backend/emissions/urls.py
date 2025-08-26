from django.urls import path
from .views_dashboard import (
    TotalTabView, Scope1TabView, Scope2TabView,
    Scope1BuildingsCompareView, Scope2BuildingsCompareView,
    ScopeRatioView, YearlyTrendView,
    TotalUseCompareView, Scope1UseCompareView, Scope2UseCompareView
)

urlpatterns = [
    path('dashboard/buildings/<int:id>/total', TotalTabView.as_view()),
    path('dashboard/buildings/<int:id>/scope1', Scope1TabView.as_view()),
    path('dashboard/buildings/<int:id>/scope2', Scope2TabView.as_view()),
    path('dashboard/scope1/buildings', Scope1BuildingsCompareView.as_view()),
    path('dashboard/scope2/buildings', Scope2BuildingsCompareView.as_view()),
    path('dashboard/buildings/<int:id>/scope-ratio', ScopeRatioView.as_view()),
    path('dashboard/buildings/<int:id>/trend', YearlyTrendView.as_view()),
    path('dashboard/buildings/<int:id>/scope1/use-compare', Scope1UseCompareView.as_view()),
    path('dashboard/buildings/<int:id>/scope2/use-compare', Scope2UseCompareView.as_view()),
    path('dashboard/buildings/<int:id>/total/use-compare', TotalUseCompareView.as_view()),
]
