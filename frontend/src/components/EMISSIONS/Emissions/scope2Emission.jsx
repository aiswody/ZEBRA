import React from "react";
import Graph1 from "./graph/scope2/graph1";
import Graph2 from "./graph/scope2/graph2";
import Graph3 from "./graph/scope2/graph3";
import Graph4 from "./graph/scope2/graph4";

const toNum = (v) => (v == null ? 0 : Number(v) || 0);

export default function Scope2Emission({ summary, compare, useCompare, trend }) {
  const items =
    compare?.items?.map((d) => ({
      name: d.building_name,
      electricity: toNum(d.electricity_kg),
    })) || [];

  const series =
    trend?.x_axis?.map((x, i) => ({
      date: `${x}-01`,
      value: toNum(trend.series?.periodic_total?.[i]),
    })) || [];

  return (
    <div style={wrap}>
      <Graph1 items={items} />
      <Graph2 orgTotal={toNum(useCompare?.building?.intensity)} usageAvg={toNum(useCompare?.category_avg?.intensity)} />
      <Graph3 scope1={0} scope2={toNum(summary?.scope2_total_kg)} />
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
