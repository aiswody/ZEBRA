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
const MAX_DECIMALS = 2;
const fmt = (v) =>
  Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: MAX_DECIMALS });

export default function Graph1({ items }) {
  // ✅ 데모 데이터 제거: 전달받은 items만 사용
  const data = useMemo(
    () =>
      (items || []).map((d) => ({
        name: d.name,
        gas: Number(d.gas) || 0,
        oil: Number(d.oil) || 0,
        other: Number(d.other) || 0,
        total: (Number(d.gas) || 0) + (Number(d.oil) || 0) + (Number(d.other) || 0),
      })),
    [items]
  );

  const xMax =
    (data.length ? Math.max(...data.map((d) => d.total), 0) : 0) * 1.1 || 1; // 0 방지용 최소 1

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
              <Bar dataKey="gas" stackId="a" fill="#16a34a" radius={[6, 6, 6, 6]} name="가스" />
              <Bar dataKey="oil" stackId="a" fill="#34d399" radius={[6, 6, 6, 6]} name="유류" />
              <Bar dataKey="other" stackId="a" fill="#a7f3d0" radius={[6, 6, 6, 6]} name="기타" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

const card = { background: "#fff", borderRadius: 16, boxShadow: "0 2px 6px rgba(0,0,0,0.06)", padding: 16 };
