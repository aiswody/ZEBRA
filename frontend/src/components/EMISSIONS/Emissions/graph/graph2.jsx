import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

/**
 * props
 * - buildingTotal: number          // 해당 건물 total
 * - usageAvgTotal: number          // 같은 용도의 평균 total
 * - title?: string
 */
export default function Graph2({
  buildingTotal = 0,
  usageAvgTotal = 0,
  title = "용도별 배출량",
}) {
  const data = [
    { name: "해당 건물", value: buildingTotal, fill: "#16a34a" }, // 진한 초록
    { name: "평균", value: usageAvgTotal, fill: "#16a34a54" }, // 연한 초록
  ];

  return (
    <div style={card}>
      <p style={titleStyle}>{title}</p>
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 16, bottom: 8}}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" tick={{ fill: "#6B7280" }} />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              tick={{ fill: "#374151", fontWeight: 700 }}
            />
            <Tooltip />
            <Bar dataKey="value" barSize={35} radius={[3, 3, 3, 3]}>
              {data.map((entry, idx) => (
                <cell key={`cell-${idx}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
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
const titleStyle = {  fontSize: 14, color: "#4B5563", margin: 0, marginBottom: 8 };