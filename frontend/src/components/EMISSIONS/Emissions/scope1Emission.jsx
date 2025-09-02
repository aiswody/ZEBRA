import React from "react";
import Graph1 from "./graph/scope1/graph1";
import Graph2 from "./graph/scope1/graph2";
import Graph3 from "./graph/scope1/graph3";
import Graph4 from "./graph/scope1/graph4";

const toNum = (v) => (v == null ? 0 : Number(v) || 0);

export default function Scope1Emission({
  summary,
  by_fuel,
  compare,
  useCompare,
  trend,
  ratio,       // ✅ emissions.jsx에서 내려준 ratio 사용
}) {
  const items =
    compare?.items?.map((d) => ({
      name: d.building_name,
      gas: toNum(d.gas_kg),
      oil: toNum(d.liquid_kg),
      other: toNum(d.solid_kg),
    })) || [];

  const series =
    trend?.x_axis?.map((x, i) => ({
      date: `${x}-01`,
      value: toNum(trend.series?.periodic_total?.[i]),
    })) || [];

  // ✅ 도넛용 값: ratio 우선, 없으면 summary 폴백
  const s1 = toNum(ratio?.scope1_kg ?? summary?.scope1_total_kg);
  const s2 = toNum(ratio?.scope2_kg ?? summary?.scope2_total_kg ?? 0);

  return (
    <div style={wrap}>
      <Graph1 items={items} />
      <Graph2
        orgTotal={toNum(useCompare?.building?.intensity)}
        usageAvg={toNum(useCompare?.category_avg?.intensity)}
      />
      <Graph3 scope1={s1} scope2={s2} title="SCOPE 비율" />
      <div style={{ gridColumn: "1 / -1" }}>
        <Graph4 series={series} unitLabel="kgCO2eq" />
      </div>
    </div>
  );
}

const wrap = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  gap: 24,
};
