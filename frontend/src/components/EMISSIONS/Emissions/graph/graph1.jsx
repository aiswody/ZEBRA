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

export default function Graph1({ building, average, title = "건물별 탄소 배출(면적당)" }) {
  const b = building || {};
  const a = average || {};
  const data = [
    { key: "전력", valueBuilding: Number(b.electricity) || 0, valueAvg: Number(a.electricity) || 0 },
    { key: "유류", valueBuilding: Number(b.liquid) || 0,     valueAvg: Number(a.liquid) || 0 },
    { key: "가스", valueBuilding: Number(b.gas) || 0,         valueAvg: Number(a.gas) || 0 },
    { key: "기타", valueBuilding: Number(b.solid) || 0,       valueAvg: Number(a.solid) || 0 },
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
            <Radar name="평균" dataKey="valueAvg" stroke="#86efac" fill="#86efac" fillOpacity={0.35} />
            <Radar name="해당 건물" dataKey="valueBuilding" stroke="#16a34a" fill="#16a34a" fillOpacity={0.55} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const card = { background: "#fff", borderRadius: 16, boxShadow: "0 2px 6px rgba(0,0,0,0.06)", padding: 16 };
const titleStyle = { fontSize: 14, color: "#4B5563", margin: 0, marginBottom: 8 };
