import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const TITLE_STYLE = { fontSize: 14, color: "#4B5563", margin: 0, marginBottom: 8 };

export default function Graph4({
  series, // [{ date:'YYYY-MM', value:number }]
  unitLabel = "배출량 [단위]",
}) {
  const fallback = useMemo(
    () =>
      [22, 40, 55, 63, 66, 54, 68, 56, 90, 95, 84, 58].map((v, i) => ({
        date: `2024-${String(i + 1).padStart(2, "0")}`,
        value: v,
      })),
    []
  );
  const source = series?.length ? series : fallback;

  const [granularity, setGranularity] = useState("month");
  const [showPeriodic, setShowPeriodic] = useState(true);
  const [showCumulative, setShowCumulative] = useState(false);

  const monthlyData = useMemo(() => {
    let cum = 0;
    return source.map((d) => {
      cum += Number(d.value) || 0;
      const [, m] = d.date.split("-");
      return { x: `${Number(m)}월`, periodic: Number(d.value) || 0, cumulative: cum };
    });
  }, [source]);

  const yearlyData = useMemo(() => {
    const byYear = new Map();
    source.forEach((d) => {
      const [y] = d.date.split("-");
      byYear.set(y, (byYear.get(y) || 0) + (Number(d.value) || 0));
    });
    let cum = 0;
    return Array.from(byYear.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([y, sum]) => {
        cum += sum;
        return { x: `${y}년`, periodic: sum, cumulative: cum };
      });
  }, [source]);

  const data = granularity === "month" ? monthlyData : yearlyData;
  const yMax = useMemo(
    () => Math.max(...data.map((d) => Math.max(d.periodic ?? 0, d.cumulative ?? 0)), 0) * 1.1,
    [data]
  );

  return (
    <div style={card}>
      <p style={TITLE_STYLE}>연도별 탄소 배출</p>

      <div style={layout}>
        {/* 차트 */}
        <div style={{ width: "100%" }}>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                <CartesianGrid stroke="#E5E7EB" />
                <XAxis dataKey="x" tick={{ fill: "#6B7280" }} />
                <YAxis
                  domain={[0, yMax]}
                  tick={{ fill: "#6B7280" }}
                  label={{ value: unitLabel, angle: -90, position: "insideLeft", dy: 40, fill: "#6B7280", fontSize: 12 }}
                />
                <Tooltip formatter={(v) => v.toLocaleString()} />

                {showPeriodic && (
                  <Line
                    type="monotone"
                    dataKey="periodic"
                    stroke="#111827"
                    strokeWidth={2}
                    dot={{ r: 3, stroke: "#fff", strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                    name="시기별"
                  />
                )}
                {showCumulative && (
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#16a34a"
                    strokeWidth={3}
                    dot={{ r: 3, stroke: "#fff", strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                    name="누적"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 컨트롤 */}
        <div style={controls}>
          <div style={ctlTitle}>그래프 형태</div>

          <label style={chk}>
            <input type="checkbox" checked={showPeriodic} onChange={(e) => setShowPeriodic(e.target.checked)} />
            <span style={chipDark} />
            시기별
          </label>

          <label style={chk}>
            <input type="checkbox" checked={showCumulative} onChange={(e) => setShowCumulative(e.target.checked)} />
            <span style={chipLight} />
            누적
          </label>

          <div style={divider} />

          <label style={radio}>
            <input type="radio" name="gran2" value="month" checked={granularity === "month"} onChange={() => setGranularity("month")} />
            개월
          </label>
          <label style={radio}>
            <input type="radio" name="gran2" value="year" checked={granularity === "year"} onChange={() => setGranularity("year")} />
            연
          </label>
        </div>
      </div>
    </div>
  );
}

const card = { background: "#fff", borderRadius: 16, boxShadow: "0 2px 6px rgba(0,0,0,0.06)", padding: 16 };
const layout = { display: "grid", gridTemplateColumns: "1fr 220px", gap: 12, alignItems: "start" };
const controls = { border: "1px solid #E5E7EB", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 10 };
const ctlTitle = { fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 6 };
const chk = { display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#374151" };
const radio = { display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#374151" };
const divider = { height: 1, background: "#E5E7EB", margin: "6px 0" };
const chipDark = { width: 12, height: 12, borderRadius: 2, background: "#14532d", display: "inline-block" };
const chipLight = { width: 12, height: 12, borderRadius: 2, background: "#bfe8d7", display: "inline-block" };