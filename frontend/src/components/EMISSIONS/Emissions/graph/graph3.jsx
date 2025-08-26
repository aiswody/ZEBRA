import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export default function Graph3({ scope1 = 0, scope2 = 0, title = "SCOPE 비율" }) {
  const { s1, s2, total } = useMemo(() => {
    const t = Number(scope1) + Number(scope2);
    return { s1: Number(scope1), s2: Number(scope2), total: t <= 0 ? 1 : t };
  }, [scope1, scope2]);

  const data = [
    { name: "SCOPE1", value: s1 },
    { name: "SCOPE2", value: s2 },
  ];
  const COLORS = ["#22c55ec5", "#15803cda"];

  return (
    <div style={card}>
      <p style={titleStyle}>{title}</p>
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              labelLine={false}
              label={(entry) => {
                const pct = Math.round((entry.value / total) * 100);
                return `${entry.name} ${pct}%`;
              }}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(val) => [`${val.toLocaleString()} (${((val / total) * 100).toFixed(0)}%)`, ""]} />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const card = { background: "#fff", borderRadius: 16, boxShadow: "0 2px 6px rgba(0,0,0,0.06)", padding: 16 };
const titleStyle = { fontSize: 14, color: "#4B5563", margin: 0, marginBottom: 8 };
