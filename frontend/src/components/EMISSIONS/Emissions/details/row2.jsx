import React from "react";
import Graph1 from "../graph/graph1";
import Graph2 from "../graph/graph2";
import Graph3 from "../graph/graph3";

export default function TotalSectionGraphs({
  buildingGas = { solid: 20, liquid: 40, gas: 30, electricity: 50 }, // 해당 건물
  averageGas = { solid: 35, liquid: 35, gas: 35, electricity: 35 }, // 전체 평균
  buildingTotal = 120,     // 해당 건물 total
  usageAvgTotal = 80,      // 동일 용도 평균 total
  scope1Emission = 30,
  scope2Emission = 70,
}) {
  return (
    <div style={row3}>
      <Graph1 building={buildingGas} average={averageGas} title="건물별 탄소 배출" />
      <Graph2 buildingTotal={buildingTotal} usageAvgTotal={usageAvgTotal} title="용도별 배출량" />
      <Graph3 scope1={scope1Emission} scope2={scope2Emission} title="SCOPE 비율" />
    </div>
  );
}

const row3 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  gap: 24,
};