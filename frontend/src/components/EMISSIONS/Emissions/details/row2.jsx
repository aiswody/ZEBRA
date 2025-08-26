import React from "react";
import Graph1 from "../graph/graph1";
import Graph2 from "../graph/graph2";
import Graph3 from "../graph/graph3";

export default function TotalSectionGraphs({
  buildingGas = { solid: 0, liquid: 0, gas: 0, electricity: 0 },
  averageGas = { solid: 0, liquid: 0, gas: 0, electricity: 0 },
  buildingTotal = 0,
  usageAvgTotal = 0,
  scope1Emission = 0,
  scope2Emission = 0,
}) {
  return (
    <div style={row3}>
      <Graph1 building={buildingGas} average={averageGas} title="건물별 탄소 배출(면적당)" />
      <Graph2 buildingTotal={buildingTotal} usageAvgTotal={usageAvgTotal} title="용도별 배출량(면적당 합)" />
      <Graph3 scope1={scope1Emission} scope2={scope2Emission} title="SCOPE 비율" />
    </div>
  );
}

const row3 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  gap: 24,
};
