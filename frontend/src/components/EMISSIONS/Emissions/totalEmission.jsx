import Row1 from "./details/row1";
import Row2 from "./details/row2";
import Row3 from "./details/row3";

const toNum = (v) => (v == null ? 0 : Number(v) || 0);

export default function TotalEmission({ summary, per_area_radar, trend }) {
  // 시계열
  const series =
    trend?.x_axis?.map((x, i) => ({
      date: `${x}-01`,
      value: toNum(trend.series?.periodic_total?.[i]),
    })) || [];

  // 면적당 강도
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

  // ⬅⬅ fallback(목록 화면)에서 Graph2가 쓸 합계 값 복구!
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

      {/* 목록(/emissions) → 위 합계로 렌더
          상세(/emissions/:id) → Row2가 buildingId 감지해서 API(벤치마크 95.xx)로 전환 */}
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
