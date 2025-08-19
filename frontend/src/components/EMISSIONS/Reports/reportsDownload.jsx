import React, { useState } from "react";
import heroTop from "../../../assets/hero-right.png"; // 상단에 넣을 이미지 경로

export default function ReportsDownload({ onDownload }) {
  const [scope, setScope] = useState("TOTAL");
  const [yearRange, setYearRange] = useState({ from: 2022, to: 2025 });
  const [orgId, setOrgId] = useState(null);
  const [buildingId, setBuildingId] = useState(null);

  const call = (fmt) => onDownload?.(fmt, scope, yearRange, orgId, buildingId);

  return (
    <div style={sx.page}>
      {/* 상단 배경 이미지 영역 */}
      <div style={sx.hero}>
        <img src={heroTop} alt="background" style={sx.heroImg} />
        <div style={sx.heroOverlay}>
          <h1 style={sx.title}>전체 리포트 다운로드</h1>
          <p style={sx.subtitle}>필터를 선택하고 형식을 골라 내려받으세요.</p>
        </div>
      </div>

      {/* 필터 */}
      <div style={sx.filters}>
        <div style={sx.filterItem}>
          <label style={sx.label}>Scope</label>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            style={sx.select}
          >
            <option value="TOTAL">Total</option>
            <option value="SCOPE1">Scope 1</option>
            <option value="SCOPE2">Scope 2</option>
          </select>
        </div>

        <div style={sx.filterItem}>
          <label style={sx.label}>시작연도(From)</label>
          <input
            type="number"
            value={yearRange.from}
            onChange={(e) =>
              setYearRange((v) => ({ ...v, from: Number(e.target.value) || v.from }))
            }
            style={sx.input}
          />
        </div>
        <div style={sx.filterItem}>
          <label style={sx.label}>끝연도(To)</label>
          <input
            type="number"
            value={yearRange.to}
            onChange={(e) =>
              setYearRange((v) => ({ ...v, to: Number(e.target.value) || v.to }))
            }
            style={sx.input}
          />
        </div>

        <div style={sx.filterItem}>
          <label style={sx.label}>기관</label>
          <input
            placeholder="ORG ID"
            value={orgId || ""}
            onChange={(e) => setOrgId(e.target.value || null)}
            style={sx.input}
          />
        </div>
        <div style={sx.filterItem}>
          <label style={sx.label}>건물</label>
          <input
            placeholder="BUILDING ID"
            value={buildingId || ""}
            onChange={(e) => setBuildingId(e.target.value || null)}
            style={sx.input}
          />
        </div>
      </div>

      {/* 다운로드 버튼 */}
      <div style={sx.buttons}>
        <button style={sx.btn} onClick={() => call("csv")}>CSV</button>
        <button style={sx.btn} onClick={() => call("xlsx")}>XLSX</button>
        <button style={sx.btn} onClick={() => call("pdf")}>PDF</button>
      </div>

      <div style={sx.note}>
        * 실제 다운로드 로직은 onDownload에서 API 호출 또는 클라이언트 생성으로 구현하세요.
      </div>
    </div>
  );
}

const sx = {
  page: { padding: 20, display: "flex", flexDirection: "column", gap: 16 },
  hero: {
    position: "relative",
    width: "100%",
    height: 160, // 원하는 높이로 조정
    overflow: "hidden",
    borderRadius: 12,
  },
  heroImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.35)", // 텍스트 가독성을 위해 반투명 오버레이
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingLeft: 20,
  },
  title: { margin: 0, fontSize: 26, fontWeight: 700 },
  subtitle: { marginTop: 6, fontSize: 14 },

  filters: { display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 12, marginTop: 10 },
  filterItem: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, color: "#333" },
  select: { height: 36, borderRadius: 8, border: "1px solid #e5e7eb", padding: "0 10px" },
  input: { height: 36, borderRadius: 8, border: "1px solid #e5e7eb", padding: "0 10px" },

  buttons: { display: "flex", gap: 8, marginTop: 12 },
  btn: { height: 36, padding: "0 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer" },

  note: { color: "#64748b", fontSize: 12, marginTop: 6 },
};