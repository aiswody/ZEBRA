import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const TITLE_STYLE = { fontSize: 14, color: "#4B5563", margin: 0, marginBottom: 8 };
const MAX_DECIMALS = 2;
const fmt = (v) =>
  Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: MAX_DECIMALS });

export default function Graph1({ items }) {
  // ✅ 데모 데이터 제거: 전달받은 items만 사용
  const data = useMemo(
    () =>
      (items || []).map((d) => ({
        name: d.name,
        electricity: Number(d.electricity) || 0,
      })),
    [items]
  );

  const xMax =
    (data.length ? Math.max(...data.map((d) => d.electricity), 0) : 0) * 1.1 || 1;

  return (
    <div style={card}>
      <p style={TITLE_STYLE}>건물별 탄소 배출</p>

      {/* ✅ 빈 상태 처리 */}
      {!data.length ? (
        <div style={{ height: 360, display: "grid", placeItems: "center", color: "#6B7280" }}>
          데이터가 없습니다
        </div>
      ) : (
        <div style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 16, bottom: 8 }}
              barCategoryGap={18}
            >
              <CartesianGrid stroke="#E5E7EB" />
              <XAxis
                type="number"
                domain={[0, xMax]}
                tick={{ fill: "#6B7280" }}
                tickFormatter={fmt}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ fill: "#374151", fontWeight: 600 }}
                tickLine={false}
              />
              <Tooltip formatter={(val, name) => [`${fmt(val)}`, name]} />
              <Legend verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: 8 }} />
              <Bar name="전기" dataKey="electricity" barSize={18} radius={[8, 8, 8, 8]} fill="#bfe8d7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

const card = { background: "#fff", borderRadius: 16, boxShadow: "0 2px 6px rgba(0,0,0,0.06)", padding: 16 };
