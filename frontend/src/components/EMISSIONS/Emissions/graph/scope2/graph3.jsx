import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const TITLE_STYLE = { fontSize: 14, color: "#4B5563", margin: 0, marginBottom: 8 };

export default function Graph3({ scope1 = 48, scope2 = 52 }) {
  const s1 = Number(scope1) || 0;
  const s2 = Number(scope2) || 0;
  const total = s1 + s2 || 1;

  const data = [
    { name: "SCOPE1", value: s1 },
    { name: "SCOPE2", value: s2 },
  ];
  const COLORS = ["#D1D5DB", "#15803cda"];

  return (
    <div style={card}>
      <p style={TITLE_STYLE}>SCOPE 비율</p>
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              labelLine={false}
              label={(e) => `${e.name} ${Math.round((e.value / total) * 100)}%`}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [`${v.toLocaleString()} (${((v / total) * 100).toFixed(0)}%)`, ""]} />
            <Legend verticalAlign="bottom" />
          </PieChart>
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