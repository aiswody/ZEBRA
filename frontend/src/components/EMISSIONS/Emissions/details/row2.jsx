import React from "react";
import { useLocation, useParams } from "react-router-dom";
import Graph1 from "../graph/graph1";
import Graph2 from "../graph/graph2";
import Graph3 from "../graph/graph3";

// URL 쿼리에서 ?year=YYYY 읽기
function useQueryYear() {
  const { search } = useLocation();
  const qs = new URLSearchParams(search);
  const y = Number(qs.get("year"));
  return Number.isFinite(y) ? y : new Date().getFullYear();
}

export default function TotalSectionGraphs({
  // 그래프1/3 및 수동 모드(fallback)용 값
  buildingGas = { solid: 0, liquid: 0, gas: 0, electricity: 0 },
  averageGas = { solid: 0, liquid: 0, gas: 0, electricity: 0 },
  buildingTotal,
  usageAvgTotal,
  scope1Emission = 0,
  scope2Emission = 0,

  // (선택) 상위에서 id/year를 직접 줄 수도 있음
  buildingId: propBuildingId,
  year: propYear,
}) {
  const { id: routeId } = useParams();
  const queryYear = useQueryYear();

  const parsedRouteId = routeId ? Number(routeId) : undefined;
  const activeBuildingId =
    propBuildingId ?? (Number.isFinite(parsedRouteId) ? parsedRouteId : undefined);
  const year = propYear ?? queryYear;

  // ✅ id가 있으면 API 모드, 없으면 숫자 props 전달(fallback)
  const graph2Props = activeBuildingId
    ? { buildingId: activeBuildingId, year, scope: "total" }
    : { buildingTotal, usageAvgTotal };

  return (
    <div style={row3}>
      <Graph1
        building={buildingGas}
        average={averageGas}
        title="건물별 탄소 배출(면적당)"
      />
      <Graph2 {...graph2Props} title="용도별 배출량(면적당 합)" />
      <Graph3
        scope1={scope1Emission}
        scope2={scope2Emission}
        title="SCOPE 비율"
      />
    </div>
  );
}

const row3 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  gap: 24,
};
