// components/EMISSIONS/Emissions/graph/scope1/graph1.jsx
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

const TITLE_STYLE = { fontSize: 14, color: "#4B5563", margin: 0, marginBottom: 8 };

export default function Graph1({ items }) {
  // 예시 데이터 (없을 때)
  const data = useMemo(
    () =>
      (items?.length
        ? items
        : [
            { name: "원홍관1", gas: 20, oil: 35, other: 45 },
            { name: "원홍관3", gas: 18, oil: 22, other: 28 },
            { name: "신공학관", gas: 25, oil: 20, other: 18 },
            { name: "혜화관", gas: 30, oil: 24, other: 36 },
            { name: "학림관", gas: 28, oil: 22, other: 30 },
            { name: "중앙도서관", gas: 28, oil: 22, other: 30 },
          ]
      ).map((d) => ({ ...d, total: (d.gas || 0) + (d.oil || 0) + (d.other || 0) })),
    [items]
  );

  const xMax = Math.max(...data.map((d) => d.total), 0) * 1.1;

  return (
    <div style={card}>
      <p style={TITLE_STYLE}>건물별 탄소 배출</p>
      <div style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 16, bottom: 8,}}
            barCategoryGap={18}
          >
            <CartesianGrid stroke="#E5E7EB" />
            <XAxis type="number" domain={[0, xMax]} tick={{ fill: "#6B7280" }} />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fill: "#374151", fontWeight: 600 }}
              tickLine={false}
            />
            <Tooltip />
            <Legend verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: 8 }} />
            <Bar dataKey="gas"  stackId="a" fill="#16a34a" radius={[6, 6, 6, 6]} name="가스" />
            <Bar dataKey="oil"  stackId="a" fill="#34d399" radius={[6, 6, 6, 6]} name="유류" />
            <Bar dataKey="other" stackId="a" fill="#a7f3d0" radius={[6, 6, 6, 6]} name="기타" />
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