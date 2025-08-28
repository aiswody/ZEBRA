// components/EMISSIONS/Emissions/details/row1.jsx
import React, { useMemo } from "react";
import GaugeSemi from "../graph/gaugeSemi"; // thresholds/min/max 지원 버전 권장
import main4 from "../../../../assets/main4.png";

const toNum = (v) => (v == null ? 0 : Number(v) || 0);

export default function Row1({
  // 총량(kgCO2e)
  scope1Emission = 0,
  scope2Emission = 0,

  // ✅ 부모에서 넘겨주세요 (TotalEmission에서 이미 보유)
  iTotal,                  // 서버 계산한 i_total (kgCO2e/m²·yr)
  areaM2,                  // summary.area_m2
  perAreaBuilding,         // {solid, liquid, gas, electricity}
  perAreaUnit = "kgCO2eq/m2",

  // 선택: 전년 대비 변화율 %
  yoyPercent,
  prevITotal,
}) {
  const totalEmission = useMemo(
    () => toNum(scope1Emission) + toNum(scope2Emission),
    [scope1Emission, scope2Emission]
  );

  // 1) 서버 i_total
  const fromITotal =
    Number.isFinite(toNum(iTotal)) && toNum(iTotal) >= 0 ? toNum(iTotal) : undefined;

  // 2) 총량/면적 (면적 변경이 즉시 반영될 때 가장 신뢰)
  const fromQuotient =
    Number.isFinite(toNum(totalEmission)) &&
    Number.isFinite(toNum(areaM2)) &&
    toNum(areaM2) > 0
      ? toNum(totalEmission) / toNum(areaM2)
      : undefined;

  // 3) per_area_radar.building 합 (i_* 합)
  const fromPerArea =
    perAreaBuilding &&
    ["solid", "liquid", "gas", "electricity"].every((k) =>
      Number.isFinite(toNum(perAreaBuilding[k]))
    )
      ? ["solid", "liquid", "gas", "electricity"].reduce(
          (s, k) => s + toNum(perAreaBuilding[k]),
          0
        )
      : undefined;

  // ✅ 우선순위: iTotal → total_kg/area_m2 → perArea 합 → 0
  const totalIntensity =
    (fromQuotient ?? fromITotal ?? fromPerArea ?? 0);
    const source = fromQuotient != null ? "quotient"
              : fromITotal   != null ? "server"
              : fromPerArea  != null ? "perArea"
              : "none";

  // ---- 전년 대비(%). 강도는 낮을수록 개선 ----
  const computedYoy =
    yoyPercent !== undefined
      ? toNum(yoyPercent)
      : Number.isFinite(toNum(prevITotal)) && toNum(prevITotal) > 0
      ? ((totalIntensity - toNum(prevITotal)) / toNum(prevITotal)) * 100
      : 0;

  // 단위가 t/…이면 임계값을 톤 기준으로 자동 변환
  const isTonUnit =
    typeof perAreaUnit === "string" && perAreaUnit.toLowerCase().startsWith("t");
  const THRESHOLDS = isTonUnit ? [0.07, 0.16] : [70, 160];

  const grade =
    totalIntensity < THRESHOLDS[0] ? "적정"
      : totalIntensity < THRESHOLDS[1] ? "보통"
      : "위험";

  const improved = computedYoy < 0;
  const arrow = improved ? "▼" : "▲";
  const deltaColor = improved ? "#0FA971" : "#ef4444";

  return (
    <div style={row}>
      {/* 현재 총 탄소 배출량 */}
      <div style={card}>
        <p style={label}>현재 총 탄소 배출량</p>
        <h2 style={value}>
          {Number.isFinite(totalEmission) ? totalEmission.toLocaleString() : 0}
          <span style={{ fontSize: 16, fontWeight: 500, marginLeft: 6, color: "#374151" }}>
            kgCO2eq
          </span>
        </h2>
        {/* 필요하면 computedYoy로 대체 가능 */}
        <p style={sub}>
          <span style={{ color: "#059669", fontWeight: 800 }}>▲ 0.6%</span>{" "}
          지난 년 대비
        </p>
      </div>

      {/* 감축 목표 이행률 */}
      <div style={card}>
        <p style={label}>감축 목표 이행률</p>
        <div style={gaugeRow}>
          <div style={{ flex: "0 0 min(220px, 45%)" }}>
            <GaugeSemi
              value={totalIntensity}
              size={200}
              stroke={14}
              min={0}
              max={isTonUnit ? 0.5 : 500}   // 값 범위에 맞게 조정
              thresholds={THRESHOLDS}
            />
          </div>
          <div style={rightCol}>
            <div style={statusText}>{grade} 등급입니다</div>
            <div style={{ ...deltaText, color: deltaColor }}>
              {arrow} {Math.abs(computedYoy).toFixed(1)}% 지난 년 대비
            </div>
            <div style={{ marginTop: 4, color: "#6B7280", fontSize: 12 }}>
              {totalIntensity.toFixed(isTonUnit ? 3 : 1)}{" "}
              {perAreaUnit || "kgCO2e/m²·yr"}
            </div>
          </div>
        </div>
      </div>

      {/* 챗봇 */}
      <div style={card}>
        <p style={label}>대안 추천 챗봇 바로가기</p>
        <div style={chatbotRow}>
          <button
            style={chatBtn}
            onClick={() => window.open("/chatbot", "_blank")}
          >
            ZEBRA
          </button>
          <img
            src={main4}
            alt="Zebra chatbot"
            style={chatImg}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>
      </div>
    </div>
  );
}

// ---- styles (그대로) ----
const row = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 16,
  marginBottom: 24,
  width: "100%",
  boxSizing: "border-box",
};
const card = {
  background: "#fff",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  minHeight: 180,
};
const label = { fontSize: 14, color: "#4B5563", margin: 0, marginBottom: 8 };
const value = { margin: 0, fontSize: 32, fontWeight: 800, color: "#111827" };
const sub = { marginTop: 6, fontSize: 12, color: "#6B7280" };
const gaugeRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  marginTop: 6,
  width: "100%",
};
const rightCol = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  minWidth: 140,
  gap: 8,
};
const statusText = { fontSize: 18, fontWeight: 800, color: "#111827", lineHeight: 1.1 };
const deltaText = { fontSize: 13, color: "#059669", fontWeight: 600 };
const chatbotRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 8,
  gap: 12,
  width: "100%",
};
const chatBtn = {
  padding: "16px 32px",
  fontSize: 18,
  fontWeight: 800,
  color: "#14532d",
  background: "#fff",
  border: "2px solid #14532d",
  borderRadius: 12,
  cursor: "pointer",
  minWidth: 160,
};
const chatImg = {
  width: 132,
  height: "auto",
  objectFit: "contain",
};
