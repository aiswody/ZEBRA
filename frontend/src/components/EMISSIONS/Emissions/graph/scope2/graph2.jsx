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

const TITLE_STYLE = { fontSize: 14, color: "#4B5563", margin: 0, marginBottom: 8 };

export default function Graph2({ orgTotal = 0, usageAvg = 0 }) {
  const data = [
    { name: "내 기관", value: Number(orgTotal) || 0, fill: "#EEF2F3" },
    { name: "같은 용도\n기관 평균", value: Number(usageAvg) || 0, fill: "#bfe8d7" },
  ];

  return (
    <div style={card}>
      <p style={TITLE_STYLE}>용도별 배출량</p>
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
            <CartesianGrid stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fill: "#6B7280" }} />
            <YAxis tick={{ fill: "#6B7280" }} />
            <Tooltip formatter={(v) => v.toLocaleString()} />
            <Bar dataKey="value" barSize={36} radius={[8, 8, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.fill} />
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