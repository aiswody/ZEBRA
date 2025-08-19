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

/**
 * props
 * - series: Array<{ date: string('YYYY-MM'), value: number }>
 *           예) [{ date: '2024-01', value: 22 }, ...]
 * - unitLabel?: string   (y축 라벨)
 */
export default function Row3({
  series,
  unitLabel = "배출량 [단위]",
}) {
  // 예시 데이터 (없을 때만 사용)
  const fallback = useMemo(
    () =>
      [
        22, 40, 55, 63, 66, 54, 68, 56, 90, 95, 84, 58,
      ].map((v, i) => ({
        date: `2024-${String(i + 1).padStart(2, "0")}`,
        value: v,
      })),
    []
  );

  const source = series?.length ? series : fallback;

  const [granularity, setGranularity] = useState("month"); // 'month' | 'year'
  const [showPeriodic, setShowPeriodic] = useState(true);  // 시기별
  const [showCumulative, setShowCumulative] = useState(false); // 누적

  // 월별 데이터 가공
  const monthlyData = useMemo(() => {
    let cum = 0;
    return source.map((d) => {
      cum += Number(d.value) || 0;
      const [, m] = d.date.split("-");
      return {
        x: `${Number(m)}월`,
        periodic: Number(d.value) || 0,
        cumulative: cum,
      };
    });
  }, [source]);

  // 연도별 데이터 가공
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
        return {
          x: `${y}년`,
          periodic: sum,
          cumulative: cum,
        };
      });
  }, [source]);

  const data = granularity === "month" ? monthlyData : yearlyData;

  // y축 최대/최소 약간의 여유
  const yMax = useMemo(
    () =>
      Math.max(
        ...data.map((d) => Math.max(d.periodic ?? 0, d.cumulative ?? 0)),
        0
      ) * 1.1,
    [data]
  );

  return (
    <div style={wrap}>
      <div style={card}>
        <p style={title}>연도별 탄소 배출</p>

        <div style={row}>
          {/* 차트 영역 */}
          <div style={chartBox}>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
                >
                  <defs>
                    <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16a34a" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#16a34a" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="#E5E7EB" />
                  <XAxis dataKey="x" tick={{ fill: "#6B7280" }} />
                  <YAxis
                    domain={[0, yMax]}
                    tick={{ fill: "#6B7280" }}
                    label={{
                      value: unitLabel,
                      angle: -90,
                      position: "insideLeft",
                      dy: 40,
                      fill: "#6B7280",
                      fontSize: 12,
                    }}
                  />
                  <Tooltip formatter={(v) => v.toLocaleString()} />

                  {/* 시기별(검정) */}
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

                  {/* 누적(초록) */}
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

          {/* 오른쪽 컨트롤 패널 */}
          <div style={controlBox}>
            <div style={controlTitle}>그래프 형태</div>

            <label style={chk}>
              <input
                type="checkbox"
                checked={showPeriodic}
                onChange={(e) => setShowPeriodic(e.target.checked)}
              />
              <span style={chipDark} />
              시기별
            </label>

            <label style={chk}>
              <input
                type="checkbox"
                checked={showCumulative}
                onChange={(e) => setShowCumulative(e.target.checked)}
              />
              <span style={chipLight} />
              누적
            </label>

            <div style={divider} />

            <label style={radio}>
              <input
                type="radio"
                name="gran"
                value="month"
                checked={granularity === "month"}
                onChange={() => setGranularity("month")}
              />
              개월
            </label>

            <label style={radio}>
              <input
                type="radio"
                name="gran"
                value="year"
                checked={granularity === "year"}
                onChange={() => setGranularity("year")}
              />
              연
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== styles ===== */
const wrap = { width: "100%" };
const card = {
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
  padding: 16,
};
const title = { fontSize: 14, color: "#4B5563", margin: 0, marginBottom: 8 };

const row = {
  display: "grid",
  gridTemplateColumns: "1fr 220px",
  gap: 12,
  alignItems: "start",
};

const chartBox = { width: "100%" };

const controlBox = {
  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  padding: 12,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const controlTitle = { fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 6 };

const chk = { display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#374151" };
const radio = { display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#374151" };
const divider = { height: 1, background: "#E5E7EB", margin: "6px 0" };

const chipDark = {
  width: 12,
  height: 12,
  borderRadius: 2,
  background: "#14532d",
  display: "inline-block",
};
const chipLight = {
  width: 12,
  height: 12,
  borderRadius: 2,
  background: "#a7f3d0",
  display: "inline-block",
};