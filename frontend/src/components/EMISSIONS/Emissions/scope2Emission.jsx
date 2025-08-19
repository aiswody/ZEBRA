import React from "react";
import Graph1 from "./graph/scope2/graph1";
import Graph2 from "./graph/scope2/graph2";
import Graph3 from "./graph/scope2/graph3";
import Graph4 from "./graph/scope2/graph4";

// ===== 기본 예시 데이터 (상위에서 안 넘기면 이 값 사용) =====
const DEFAULT_BUILDINGS = [
  { name: "원홍관1", electricity: 78 },
  { name: "원홍관3", electricity: 52 },
  { name: "신공학관", electricity: 49 },
  { name: "혜화관",   electricity: 68 },
  { name: "학림관",   electricity: 61 },
];

const DEFAULT_USAGE = { orgTotal: 72, usageAvg: 65 };
const DEFAULT_SCOPE = { scope1: 48, scope2: 52 };

const DEFAULT_SERIES = [
  { date: "2024-01", value: 22 },
  { date: "2024-02", value: 40 },
  { date: "2024-03", value: 55 },
  { date: "2024-04", value: 63 },
  { date: "2024-05", value: 66 },
  { date: "2024-06", value: 54 },
  { date: "2024-07", value: 68 },
  { date: "2024-08", value: 56 },
  { date: "2024-09", value: 90 },
  { date: "2024-10", value: 95 },
  { date: "2024-11", value: 84 },
  { date: "2024-12", value: 58 },
];

export default function Scope2Emission({
  buildings = DEFAULT_BUILDINGS, // [{ name, electricity }]
  usage = DEFAULT_USAGE,         // { orgTotal, usageAvg }
  scope = DEFAULT_SCOPE,         // { scope1, scope2 }
  series = DEFAULT_SERIES,       // [{date, value}]
}) {
  return (
    <div style={wrap}>
      {/* 상단 3개 */}
      <Graph1 items={buildings} />
      <Graph2 orgTotal={usage.orgTotal} usageAvg={usage.usageAvg} />
      <Graph3 scope1={scope.scope1} scope2={scope.scope2} />

      {/* 하단(전체 폭) */}
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