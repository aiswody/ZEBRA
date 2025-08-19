import React from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
  Tooltip,
} from "recharts";

/**
 * props
 * - building: { solid, liquid, gas, electricity }   // 해당 건물 값
 * - average:  { solid, liquid, gas, electricity }   // 등록 건물 평균
 * - title?: string
 */

export default function Graph1({ building, average, title = "건물별 탄소 배출" }) {
  const data = [
    { key: "전력", valueBuilding: building?.electricity ?? 0, valueAvg: average?.electricity ?? 0 },
    { key: "유류", valueBuilding: building?.liquid ?? 0, valueAvg: average?.liquid ?? 0 },
    { key: "가스", valueBuilding: building?.gas ?? 0, valueAvg: average?.gas ?? 0 },
    { key: "기타", valueBuilding: building?.solid ?? 0, valueAvg: average?.solid ?? 0 },
];

  return (
    <div style={card}>
      <p style={titleStyle}>{title}</p>
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis dataKey="key" tick={{ fill: "#374151", fontSize: 12 }} />
            <Tooltip />
            <Legend verticalAlign="bottom" height={24} />
            {/* 평균 (연한 초록) */}
            <Radar
              name="평균"
              dataKey="valueAvg"
              stroke="#86efac"
              fill="#86efac"
              fillOpacity={0.35}
            />
            {/* 해당 건물 (진한 초록) */}
            <Radar
              name="해당 건물"
              dataKey="valueBuilding"
              stroke="#16a34a"
              fill="#16a34a"
              fillOpacity={0.55}
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
const titleStyle = {  fontSize: 14, color: "#4B5563", margin: 0, marginBottom: 8  };