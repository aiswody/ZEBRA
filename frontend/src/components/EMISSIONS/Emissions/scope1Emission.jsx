// components/EMISSIONS/Emissions/scope1Emission.jsx
import React from "react";
import Graph1 from "./graph/scope1/graph1";
import Graph2 from "./graph/scope1/graph2";
import Graph3 from "./graph/scope1/graph3";
import Graph4 from "./graph/scope1/graph4";

/**
 * props (필요 시 서버 데이터로 주입)
 * - buildings: Array<{ name, gas, oil, other }>
 * - usage: { orgTotal, usageAvg }
 * - scope: { scope1, scope2 }
 * - series: Array<{ date:'YYYY-MM', value:number }>
 */
export default function Scope1Emission({
  buildings,
  usage,
  scope,
  series,
}) {
  return (
    <div style={wrap}>
      {/* 상단 3개 */}
      <Graph1 items={buildings} />
      <Graph2 orgTotal={usage?.orgTotal} usageAvg={usage?.usageAvg} />
      <Graph3 scope1={scope?.scope1} scope2={scope?.scope2} />

      {/* 하단 라인차트(전체 폭) */}
      <div style={{ gridColumn: "1 / -1" }}>
        <Graph4 series={series} unitLabel="배출량 [단위]" />
      </div>
    </div>
  );
}

const wrap = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  gap: 24,
};