import React, { useMemo } from "react";
import GaugeSemi from "../graph/gaugeSemi";
import main4 from "../../../../assets/main4.png";

export default function TotalEmission({
  scope1Emission = 0,
  scope2Emission = 0,
}) {
  const totalEmission = useMemo(
    () => Number(scope1Emission) + Number(scope2Emission),
    [scope1Emission, scope2Emission]
  );

  return (
    <div style={row}>
      <div style={card}>
        <p style={label}>현재 총 탄소 배출량</p>
        <h2 style={value}>
          {Number.isFinite(totalEmission) ? totalEmission.toLocaleString() : 0}
        </h2>
        <p style={sub}>
          <span style={{ color: "#059669", fontWeight: 700 }}>▲ 0.6%</span>{" "}
          지난 년 대비
        </p>
      </div>

      <div style={card}>
        <p style={label}>감축 목표 이행률</p>
        <div style={gaugeRow}>
          <div style={{ flex: "0 0 min(220px, 45%)" }}>
            <GaugeSemi value={68} size={200} stroke={14} />
          </div>
          <div style={rightCol}>
            <div style={statusText}>위험 등급입니다</div>
            <div style={deltaText}>▲ 0.6% 지난 년 대비</div>
          </div>
        </div>
      </div>

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
