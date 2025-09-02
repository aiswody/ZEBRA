// totalEmission.jsx
import Row1 from "./details/row1";
import Row2 from "./details/row2";
import Row3 from "./details/row3";

const toNum = (v) => (v == null ? 0 : Number(v) || 0);

export default function TotalEmission({
  summary,
  per_area_radar,
  trend,
  useCompare,
  buildingId,   // ← 추가: 상위에서 내려줄 선택 건물 id
  year,         // ← 선택 (쿼리/상태에서 넘길 수 있으면)
}) {
  const series =
    trend?.x_axis?.map((x, i) => ({
      date: `${x}-01`,
      value: toNum(trend.series?.periodic_total?.[i]),
    })) || [];

  const b = per_area_radar?.building || {};
  const p = per_area_radar?.portfolio_avg || {};
  const buildingGas = {
    solid: toNum(b.solid),
    liquid: toNum(b.liquid),
    gas: toNum(b.gas),
    electricity: toNum(b.electricity),
  };
  const averageGas = {
    solid: toNum(p.solid),
    liquid: toNum(p.liquid),
    gas: toNum(p.gas),
    electricity: toNum(p.electricity),
  };

  const buildingTotal =
    buildingGas.solid + buildingGas.liquid + buildingGas.gas + buildingGas.electricity;
  const usageAvgTotal =
    averageGas.solid + averageGas.liquid + averageGas.gas + averageGas.electricity;

  return (
    <>
      <Row1
        scope1Emission={toNum(summary?.scope1_kg)}
        scope2Emission={toNum(summary?.scope2_kg)}
        perAreaBuilding={buildingGas}
        areaM2={toNum(summary?.area_m2)}
        iTotal={toNum(summary?.i_total)}
      />

      <Row2
        buildingGas={buildingGas}
        averageGas={averageGas}
        buildingTotal={buildingTotal}
        usageAvgTotal={usageAvgTotal}
        scope1Emission={toNum(summary?.scope1_kg)}
        scope2Emission={toNum(summary?.scope2_kg)}
        useCompare={useCompare}
        buildingId={buildingId}   // ← 여기!
        year={year}               // ← 선택
      />

      <Row3 series={series} unitLabel="kgCO2eq" />
    </>
  );
}
