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
 * Row3 – 연도별 총 배출량 비교 전용
 * - 월/연 토글 제거 (연도 집계만 표시)
 * - "시기별(해당 연도 합계)" / "누적" 토글만 유지
 * - 실데이터가 1개 연도뿐이면 2022–2024 더미를 자동 주입(값은 아래 dummyYears에서 조정)
 */
export default function Row3({ series, unitLabel = "kgCO₂e" }) {
  // 사용자가 이전연도 데이터가 없을 때 주입할 더미(총배출량, 단위는 unitLabel과 동일)
  const dummyYears = useMemo(
    () => ({
      2021: 370825.251,
      2022: 356420.376,
      2023: 272029.913,
      2024: 240500.622,
    }),
    []
  );

  // 1) 입력 series가 없으면 기본 더미를 연도 데이터로 사용
  //    입력 series는 보통 [{date:'YYYY-MM', value:number}, ...] 형태(월 단위)라고 가정
  const fromSeriesByYear = useMemo(() => {
    const byYear = new Map();

    if (Array.isArray(series) && series.length > 0) {
      series.forEach((d) => {
        // date가 'YYYY'만 올 수도 있고 'YYYY-MM'일 수도 있음 → 앞 4자리만 연도로 사용
        const yFromDate = typeof d.date === "string" ? d.date.slice(0, 4) : "";
        const y = String(d.year ?? yFromDate).replace(/\D/g, "");
        const val = Number(d.value) || 0;
        if (!y) return;
        byYear.set(y, (byYear.get(y) || 0) + val);
      });
    }

    // 2) 실데이터가 1개 연도 이하라면(== 비교 불가) 더미 연도 주입
    if (byYear.size <= 1) {
      Object.entries(dummyYears).forEach(([y, v]) => {
        if (!byYear.has(y)) byYear.set(y, Number(v) || 0);
      });
    }

    // 정렬 후 누적치 계산
    let cum = 0;
    return Array.from(byYear.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([y, sum]) => {
        cum += sum;
        return { x: `${y}년`, periodic: sum, cumulative: cum };
      });
  }, [series, dummyYears]);

  const data = fromSeriesByYear;

  const [showPeriodic, setShowPeriodic] = useState(true);
  const [showCumulative, setShowCumulative] = useState(false);

  const yMax = useMemo(
    () =>
      Math.max(
        ...data.map((d) => Math.max(showPeriodic ? d.periodic : 0, showCumulative ? d.cumulative : 0)),
        0
      ) * 1.1,
    [data, showPeriodic, showCumulative]
  );

  return (
    <div style={wrap}>
      <div style={card}>
        <p style={title}>연도별 탄소 배출</p>

        <div style={row}>
          <div style={chartBox}>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
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
            {/* 월/연 라디오 제거 */}
          </div>
        </div>
      </div>
    </div>
  );
}

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
const chipDark = { width: 12, height: 12, borderRadius: 2, background: "#14532d", display: "inline-block" };
const chipLight = { width: 12, height: 12, borderRadius: 2, background: "#a7f3d0", display: "inline-block" };
