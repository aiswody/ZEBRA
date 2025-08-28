import React from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from "recharts";

const toNum = (v) => (v == null ? 0 : Number(v) || 0);

// 보기 좋은 반올림 max
const niceMax = (x) => {
  if (x <= 1) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(x)));
  const n = Math.ceil((x * 1.1) / exp); // 10% 여유
  const step = n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * exp;
};

const CustomTooltip = ({ active, payload, label, unit, digits = 1 }) => {
  if (!active || !payload || !payload.length) return null;
  const b = payload.find((p) => p.dataKey === "valueBuilding");
  const a = payload.find((p) => p.dataKey === "valueAvg");
  return (
    <div style={{
      background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8,
      padding: "8px 10px", boxShadow: "0 4px 10px rgba(0,0,0,0.06)"
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {a && (
        <div style={{ color: "#065f46" }}>
          평균: {toNum(a.value).toFixed(digits)} {unit}
        </div>
      )}
      {b && (
        <div style={{ color: "#16a34a" }}>
          해당 건물: {toNum(b.value).toFixed(digits)} {unit}
        </div>
      )}
    </div>
  );
};

export default function Graph1({
  building,
  average,
  title = "건물별 탄소 배출(면적당)",
  unit = "kgCO2e/m²",     // ← 표기 단위
  digits = 1,                // ← 소수점 자릿수
}) {
  const b = building || {};
  const a = average || {};

  // 매핑: 전력=electricity, 유류=liquid, 가스=gas, 기타=solid
  const data = [
    { key: "전력", valueBuilding: toNum(b.electricity), valueAvg: toNum(a.electricity) },
    { key: "유류", valueBuilding: toNum(b.liquid),      valueAvg: toNum(a.liquid) },
    { key: "가스", valueBuilding: toNum(b.gas),         valueAvg: toNum(a.gas) },
    { key: "기타", valueBuilding: toNum(b.solid),       valueAvg: toNum(a.solid) },
  ];

  const maxVal = Math.max(
    ...data.flatMap((d) => [d.valueBuilding, d.valueAvg]),
    0
  );
  const domainMax = niceMax(maxVal);

  return (
    <div style={card}>
      <p style={titleStyle}>{title}</p>
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis dataKey="key" tick={{ fill: "#374151", fontSize: 12 }} />
            {/* 반경 축: 0 ~ domainMax */}
            <PolarRadiusAxis
              angle={90}
              domain={[0, domainMax || 1]}
              tick={{ fill: "#9CA3AF", fontSize: 10 }}
              tickCount={5}
              axisLine={false}
            />

            <Tooltip
              content={<CustomTooltip unit={unit} digits={digits} />}
            />
            <Legend
              verticalAlign="bottom"
              height={24}
              wrapperStyle={{ paddingTop: 6 }}
            />

            {/* 평균 먼저 깔고(연한색), 해당 건물 위에(진한색) 올려 가독성 ↑ */}
            <Radar
              name="평균"
              dataKey="valueAvg"
              stroke="#16a34a"
              fill="#16a34a"
              fillOpacity={0.55}
            
            />
            <Radar
              name="해당 건물"
              dataKey="valueBuilding"
              stroke="#86efac"
              fill="#86efac"
              fillOpacity={0.35}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const card = {
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
  padding: 16,
};
const titleStyle = { fontSize: 14, color: "#4B5563", margin: 0, marginBottom: 8 };
