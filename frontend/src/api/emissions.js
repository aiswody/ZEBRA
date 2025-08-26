import { api } from "./client";

// Total
export const getTotalTab = (buildingId, year) =>
  api.get(`/dashboard/buildings/${buildingId}/total`, { params: { year } });

// Scope1
export const getScope1Tab = (buildingId, year) =>
  api.get(`/dashboard/buildings/${buildingId}/scope1`, { params: { year } });

// Scope2
export const getScope2Tab = (buildingId, year) =>
  api.get(`/dashboard/buildings/${buildingId}/scope2`, { params: { year } });

// 기관 내 건물 비교
export const getScope1BuildingsCompare = (year) =>
  api.get(`/dashboard/scope1/buildings`, { params: { year } });

export const getScope2BuildingsCompare = (year) =>
  api.get(`/dashboard/scope2/buildings`, { params: { year } });

// 비율 (도넛)
export const getScopeRatio = (buildingId, year) =>
  api.get(`/dashboard/buildings/${buildingId}/scope-ratio`, { params: { year } });

// 트렌드
export const getYearlyTrend = (buildingId, year, scope = "total") =>
  api.get(`/dashboard/buildings/${buildingId}/trend`, { params: { year, scope } });

// 용도별 비교
export const getUseCompare = (buildingId, year, scope) =>
  api.get(`/dashboard/buildings/${buildingId}/${scope}/use-compare`, { params: { year } });
