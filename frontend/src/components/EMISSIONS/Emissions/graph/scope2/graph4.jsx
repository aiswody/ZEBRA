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
  series,                  // [{date:'YYYY-MM' 또는 'YYYY', value:number}, ...] (scope2 총배출: 전력)
  unitLabel = "kgCO₂e",
}) {
  // 비교용 더미 연도(원하면 값만 조정하세요)
  const dummyYears = useMemo(
    () => ({ 
      2021: 528431.211,
      2022: 458020.741, 
      2023: 472008.507, 
      2024: 425082.392 }),
    []
  );

  // 입력 series → 연도 합계로 집계 + 필요 시 더미 병합
  const yearlyData = useMemo(() => {
    const byYear = new Map();

    if (Array.isArray(series) && series.length > 0) {
      series.forEach((d) => {
        const yFromDate = typeof d.date === "string" ? d.date.slice(0, 4) : "";
        const y = String(d.year ?? yFromDate).replace(/\D/g, "");
        const v = Number(d.value) || 0;
        if (!y) return;
        byYear.set(y, (byYear.get(y) || 0) + v);
      });
    }

    // 실데이터 연도가 1개 이하이면 더미 주입
    if (byYear.size <= 1) {
      Object.entries(dummyYears).forEach(([y, v]) => {
        if (!byYear.has(y)) byYear.set(y, Number(v) || 0);
      });
    }

    // 정렬 + 누적
    let cum = 0;
    return Array.from(byYear.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([y, sum]) => {
        cum += sum;
        return { x: `${y}년`, periodic: sum, cumulative: cum };
      });
  }, [series, dummyYears]);

  const data = yearlyData;

  const [showPeriodic, setShowPeriodic] = useState(true);
  const [showCumulative, setShowCumulative] = useState(false);

  const yMax = useMemo(() => {
    return (
      Math.max(
        ...data.map((d) =>
          Math.max(showPeriodic ? d.periodic ?? 0 : 0, showCumulative ? d.cumulative ?? 0 : 0)
        ),
        0
      ) * 1.1
    );
  }, [data, showPeriodic, showCumulative]);

  return (
    <div style={card}>
      <p style={TITLE_STYLE}>연도별 탄소 배출 (Scope 2)</p>

      <div style={layout}>
        <div style={{ width: "100%" }}>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                <CartesianGrid stroke="#E5E7EB" />
                <XAxis dataKey="x" tick={{ fill: "#6B7280" }} />
                <YAxis
                  domain={[0, yMax]}
                  tick={{ fill: "#6B7280" }}
                  label={{
                    value: `배출량 [${unitLabel}]`,
                    angle: -90,
                    position: "insideLeft",
                    dy: 40,
                    fill: "#6B7280",
                    fontSize: 12,
                  }}
                />
                <Tooltip formatter={(v) => Number(v).toLocaleString()} />

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

        <div style={controls}>
          <div style={ctlTitle}>그래프 형태</div>

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

          {/* 월/연 라디오는 제거됨 (연도 비교 전용) */}
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
const divider = { height: 1, background: "#E5E7EB", margin: "6px 0" };
const chipDark = { width: 12, height: 12, borderRadius: 2, background: "#14532d", display: "inline-block" };
const chipLight = { width: 12, height: 12, borderRadius: 2, background: "#bfe8d7", display: "inline-block" };
