import Row1 from "./details/row1";
import Row2 from "./details/row2";
import Row3 from "./details/row3";

const toNum = (v) => (v == null ? 0 : Number(v) || 0);

export default function TotalEmission({ summary, per_area_radar, trend }) {
  // ── 시계열 매핑 (YearlyTrend는 'YYYY'만 오므로 'YYYY-01'로 보정)
  const series =
    trend?.x_axis?.map((x, i) => ({
      date: `${x}-01`,
      value: toNum(trend.series?.periodic_total?.[i]),
    })) || [];

  // ── 레이더 & 비교: 면적당 강도값을 number로 정규화
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
      />
      <Row2
        buildingGas={buildingGas}
        averageGas={averageGas}
        buildingTotal={buildingTotal}
        usageAvgTotal={usageAvgTotal}
        scope1Emission={toNum(summary?.scope1_kg)}
        scope2Emission={toNum(summary?.scope2_kg)}
      />
      <Row3 series={series} unitLabel="kgCO2eq" />
    </>
  );
}
