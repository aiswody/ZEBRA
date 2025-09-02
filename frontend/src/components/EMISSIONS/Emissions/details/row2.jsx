// components/EMISSIONS/Emissions/details/row2.jsx
import React from "react";
import { useLocation, useParams } from "react-router-dom";
import Graph1 from "../graph/graph1";
import Graph2 from "../graph/graph2";
import Graph3 from "../graph/graph3";

function useQueryYear() {
  const { search } = useLocation();
  const qs = new URLSearchParams(search);
  const y = Number(qs.get("year"));
  return Number.isFinite(y) ? y : new Date().getFullYear();
}

export default function Row2({
  // Graph1
  buildingGas = { solid: 0, liquid: 0, gas: 0, electricity: 0 },
  averageGas = { solid: 0, liquid: 0, gas: 0, electricity: 0 },

  // Graph2 fallback 합계
  buildingTotal = 0,
  usageAvgTotal = 0,

  // Graph3
  scope1Emission = 0,
  scope2Emission = 0,

  // scope1과 동일한 구조의 useCompare (building.intensity, category_avg.intensity)
  useCompare,
  // (선택) 상위에서 id/year 전달
  buildingId: propBuildingId,
  year: propYear,
}) {
  const { id: routeId } = useParams();
  const queryYear = useQueryYear();
  const parsedRouteId = routeId ? Number(routeId) : undefined;
  const activeBuildingId =
    propBuildingId ?? (Number.isFinite(parsedRouteId) ? parsedRouteId : undefined);
  const year = propYear ?? queryYear;

  // Graph2에 전달할 props 결정 우선순위:
  // 1) useCompare 값이 있으면 그 값 사용
  // 2) buildingId 있으면 API 모드로 요청
  // 3) 그 외엔 합계(fallback)
  const useCompareOrg = Number(useCompare?.building?.intensity ?? NaN);
  const useCompareAvg = Number(useCompare?.category_avg?.intensity ?? NaN);
  const hasUseCompare = Number.isFinite(useCompareOrg) && Number.isFinite(useCompareAvg);

  const graph2Props = hasUseCompare
    ? { mode: "direct", orgTotal: useCompareOrg, usageAvg: useCompareAvg }
    : activeBuildingId
    ? { mode: "api", buildingId: activeBuildingId, year, scope: "total" }
    : { mode: "fallback", buildingTotal, usageAvgTotal };

  return (
    <div style={row3}>
      <Graph1
        building={buildingGas}
        average={averageGas}
        title="건물별 탄소 배출(면적당)"
      />
      <Graph2 {...graph2Props} title="용도별 배출량" />
      <Graph3 scope1={scope1Emission} scope2={scope2Emission} title="SCOPE 비율" />
    </div>
  );
}

const row3 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  gap: 24,
};
