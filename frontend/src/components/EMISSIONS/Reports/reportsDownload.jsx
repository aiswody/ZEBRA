import React, { useEffect, useState } from "react";
import heroTop from "../../../assets/hero-right.png"; // 우측 일러스트

export default function ReportsDownload({ onDownload }) {
  const [scope, setScope] = useState("TOTAL");
  const [yearRange, setYearRange] = useState({ from: 2022, to: 2025 });
  const [orgId, setOrgId] = useState(null);
  const [buildingId, setBuildingId] = useState(null);

  // 화면이 “낮은 높이”일 땐 우측 이미지를 숨겨 1열로 전환 (세로 스크롤 감소)
  const [isShort, setIsShort] = useState(false);
  useEffect(() => {
    const onResize = () => setIsShort(window.innerHeight < 820);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const call = (fmt) => onDownload?.(fmt, scope, yearRange, orgId, buildingId);

  return (
    <div style={sx.page}>
      {/* 상단 안내 카드 – 화면 가로 꽉 채움 */}
      <section style={sx.infoCard}>
        <h2 style={sx.infoTitle}>전체 리포트 다운로드</h2>
        <p style={sx.infoDesc}>필터를 선택하고 형식을 골라 내려받으세요.</p>
      </section>

      {/* 히어로 카드 – 높이/여백 컴팩트 + 낮은 화면에선 1열 */}
      <section
        style={{
          ...sx.heroCard,
          height: "clamp(280px, 44vh, 420px)",
          gridTemplateColumns: isShort ? "1fr" : "1fr 1fr",
        }}
      >
        <div style={sx.heroLeft}>
          <h1 style={sx.title}>기관 및 기간 선택</h1>
          <p style={sx.subtitle}>기관과 시작연도를 선택하세요.</p>

          {/* 얇은 구분선 */}
          <div style={sx.hr} />

          {/* 메인 폼 */}
          <div style={sx.formCol}>
            <label style={sx.label}>시작연도(From)</label>
            <div style={sx.inputWrap}>
              <span style={sx.leadingIcon} aria-hidden>
                📅
              </span>
              <input
                type="number"
                value={yearRange.from}
                onChange={(e) =>
                  setYearRange((v) => ({
                    ...v,
                    from: Number(e.target.value) || v.from,
                  }))
                }
                style={sx.input}
              />
              <span style={sx.trailingCaret} aria-hidden>
                ▾
              </span>
            </div>

            <label style={{ ...sx.label, marginTop: 8 }}>기관</label>
            <div style={sx.inputWrap}>
              <span style={sx.leadingIcon} aria-hidden>
                🏢
              </span>
              <input
                placeholder="ORG ID"
                value={orgId || ""}
                onChange={(e) => setOrgId(e.target.value || null)}
                style={sx.input}
              />
              <span style={sx.trailingCaret} aria-hidden>
                ▾
              </span>
            </div>

            <button style={sx.primaryBtn} onClick={() => call("pdf")}>
              보고서 다운로드
            </button>
          </div>
        </div>

        {/* 우측 일러스트: 낮은 화면에선 숨김 */}
        {!isShort && (
          <div style={sx.heroRight}>
            <img src={heroTop} alt="illustration" style={sx.illustration} />
          </div>
        )}
      </section>

      {/* 숨김 블록(틀 유지) */}
      <div style={sx.filtersHidden}>
        <div style={sx.filterItemHidden}>
          <label style={sx.label}>Scope</label>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            style={sx.selectHidden}
          >
            <option value="TOTAL">Total</option>
            <option value="SCOPE1">Scope 1</option>
            <option value="SCOPE2">Scope 2</option>
          </select>
        </div>

        <div style={sx.filterItemHidden}>
          <label style={sx.label}>끝연도(To)</label>
          <input
            type="number"
            value={yearRange.to}
            onChange={(e) =>
              setYearRange((v) => ({
                ...v,
                to: Number(e.target.value) || v.to,
              }))
            }
            style={sx.inputHidden}
          />
        </div>
      </div>

      <div style={sx.note}>
        * 상세 범위(Scope)와 끝연도는 기본값으로 설정되었습니다.
      </div>
    </div>
  );
}

/* ───────── 스타일 ───────── */
const sx = {
  // 좌우는 꽉 차게, 가로 스크롤 차단
  page: {
    padding: "16px 0",
    background: "#f5f7f8",
    minHeight: "100vh",
    boxSizing: "border-box",
    overflowX: "hidden",
  },

  /* 상단 안내 카드 */
  infoCard: {
    width: "100%",
    margin: "0 0 12px 0",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 0,
    padding: "12px 16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    boxSizing: "border-box",
  },
  infoTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" },
  infoDesc: { margin: "4px 0 0", fontSize: 13, color: "#475569" },

  /* 히어로 카드 */
  heroCard: {
    width: "100%",
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
    display: "grid",
    overflow: "hidden",
    boxSizing: "border-box",
  },

  heroLeft: {
    padding: "20px 20px 20px 24px", // ← 패딩 축소
    display: "flex",
    flexDirection: "column",
  },

  heroRight: { position: "relative", width: "100%", height: "100%" },
  illustration: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  // 타이틀/서브타이틀 + 구분선 (컴팩트)
  title: { margin: 0, marginBottom: 6, fontSize: 24, fontWeight: 800, color: "#0f172a" },
  subtitle: { margin: "6px 0 12px", fontSize: 14, color: "#475569" },
  hr: { height: 1, background: "#e5e7eb", margin: "10px 0 12px" },

  formCol: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    maxWidth: "100%",
    width: "100%",
  },
  label: { fontSize: 12, color: "#475569", marginBottom: 4 },

  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    height: 44,                 // ← 48 → 44
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    padding: "0 44px",
    marginTop: 4,
    marginBottom: 6,
    width: "85%",
  },
  input: {
    width: "100%",
    height: "100%",
    border: "none",
    outline: "none",
    fontSize: 16,
    color: "#111827",
    background: "transparent",
  },
  leadingIcon: { position: "absolute", left: 12, fontSize: 18, opacity: 0.9 },
  trailingCaret: { position: "absolute", right: 12, fontSize: 16, opacity: 0.5, transform: "translateY(-1px)" },

  primaryBtn: {
    marginTop: 10,
    height: 52,                // ← 56 → 52
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(180deg, #068729 0%, #068729 100%)",
    color: "#fff",
    fontSize: 20,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(34,197,94,0.18)",
  },

  // 숨김(틀 유지)
  filtersHidden: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0,1fr))",
    gap: 12,
    marginTop: 0,
    height: 0,
    overflow: "hidden",
  },
  filterItemHidden: { display: "flex", flexDirection: "column", gap: 6 },
  selectHidden: { height: 0, padding: 0, border: "none", outline: "none", opacity: 0 },
  inputHidden: { height: 0, padding: 0, border: "none", outline: "none", opacity: 0 },

  note: { color: "#64748b", fontSize: 12, margin: "8px 16px 0" },
};