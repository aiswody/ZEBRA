// src/components/INTRO/third.jsx
import React from "react";
import { Link } from "react-router-dom";
import PageNav from "./pagenav";
import zebraLogo from "../../../assets/zebraLogo.png";

export default function Third() {
  const FOOTER_H = 56; // 고정 푸터 높이(대략)

  const sx = {
    main: { backgroundColor: "#f5f7f8", overflowX: "hidden" }, // 가로 넘침 방지
    wrap: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: `80px 0 ${FOOTER_H + 24}px`, // 푸터와 겹치지 않게 하단 패딩 추가
      background:
        "radial-gradient(1400px 600px at 100% -100px, rgba(16,185,129,0.08), transparent 60%), #f5f7f8",
      boxSizing: "border-box",
    },
    container: {
      maxWidth: 1024,                // 1200 → 1024로 축소 (요구 폭에 맞춤)
      margin: "0 auto",
      padding: "0 24px",
      width: "100%",
      boxSizing: "border-box",
      minWidth: 0,
    },
    title: {
      textAlign: "center",
      fontWeight: 900,
      fontSize: "clamp(26px,4.6vw,48px)",
      color: "#111827",
      marginBottom: 28,              // 살짝 줄여 안정감
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(2,minmax(0,1fr))",
      gap: 24,
      minWidth: 0,                   // flex/grid 자식 넘침 방지
    },
    card: {
      background: "#fff",
      borderRadius: 18,
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      padding: 24,
      border: "1px solid rgba(0,0,0,0.06)",
      minWidth: 0,                   // 긴 문장/URL로 인한 가로 넘침 방지
      boxSizing: "border-box",
    },
    row: {
      display: "grid",
      gridTemplateColumns: "auto 1fr auto",
      alignItems: "center",
      gap: 16,
      minWidth: 0,
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 34,
      height: 34,
      borderRadius: 10,
      background: "#10b981",
      color: "#fff",
      fontWeight: 800,
      boxShadow: "0 6px 16px rgba(16,185,129,0.35)",
    },
    cardTitle: { fontWeight: 800, fontSize: 18, color: "#111827" },
    cardBody: {
      fontSize: 14,
      color: "#374151",
      lineHeight: 1.7,
      marginTop: 10,
      wordBreak: "break-word",       // 긴 단어 줄바꿈
      overflowWrap: "anywhere",      // 아주 긴 문자열 대응
    },
    icon: { width: 68, height: 68, flexShrink: 0 },

    footer: {
      position: "fixed",
      left: "50%",
      transform: "translateX(-50%)",
      bottom: 16,
      zIndex: 10,
      background: "rgba(255,255,255,0.9)",
      borderRadius: 10,
      boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
      padding: "10px 14px",
      backdropFilter: "blur(2px)",
    },
    footerWrap: { display: "flex", alignItems: "center", textDecoration: "none" },
    footerLogoImg: { height: 28, marginRight: 10, filter: "contrast(1.15) saturate(1.1)" },
    footerTitle: { fontWeight: "bold", fontSize: 15, color: "#111827" },
    footerSub: { fontSize: 11, color: "#6b7280", whiteSpace: "nowrap" },
  };

  return (
    <main style={sx.main}>
      <PageNav style={sx.wrap} prev="/second" next="/first">
        <div style={sx.container}>
          <h2 style={sx.title}>공공건축물의 지속가능한 미래를 위한 핵심 기능</h2>

          <style>{`@media (max-width: 1024px){ .grid2 { grid-template-columns: 1fr; } }`}</style>
          <div className="grid2" style={sx.grid}>
            <article style={sx.card}>
              <div style={sx.row}>
                <div style={sx.badge}>1</div>
                <div style={sx.cardTitle}>자동 탄소 배출량 산정</div>
                <svg viewBox="0 0 96 96" style={sx.icon}><rect x="10" y="26" width="76" height="48" rx="8" fill="#e2f2e9"/><text x="28" y="56" fontSize="20" fill="#10b981">CO₂</text></svg>
              </div>
              <p style={sx.cardBody}>에너지 사용 데이터를 입력하면, 국제·국내 기준(환경부, IPCC, K-GHG 등)에 맞춰 자동으로 배출량을 산정해줘요.</p>
            </article>

            <article style={sx.card}>
              <div style={sx.row}>
                <div style={sx.badge}>2</div>
                <div style={sx.cardTitle}>에너지 현황 대시보드</div>
                <svg viewBox="0 0 96 96" style={sx.icon}><rect x="14" y="20" width="68" height="56" rx="8" fill="#eaf2ff"/><rect x="26" y="56" width="12" height="10" fill="#1f2937"/><rect x="42" y="48" width="12" height="18" fill="#1f2937"/><rect x="58" y="40" width="12" height="26" fill="#1f2937"/></svg>
              </div>
              <p style={sx.cardBody}>기관별 추이를 대시보드로 비교 분석해 현황을 쉽게 파악할 수 있어요.</p>
            </article>

            <article style={sx.card}>
              <div style={sx.row}>
                <div style={sx.badge}>3</div>
                <div style={sx.cardTitle}>감축 시뮬레이션 및 대안 제시</div>
                <svg viewBox="0 0 96 96" style={sx.icon}><circle cx="48" cy="48" r="28" fill="#e6f7ee"/><path d="M38 50l8 8 16-16" stroke="#10b981" strokeWidth="6" fill="none" strokeLinecap="round" /></svg>
              </div>
              <p style={sx.cardBody}>재생에너지 도입, 설비 교체, 효율 개선 등 시나리오로 예상 효과를 시뮬레이션하고 대안을 추천해줘요.</p>
            </article>

            <article style={sx.card}>
              <div style={sx.row}>
                <div style={sx.badge}>4</div>
                <div style={sx.cardTitle}>보고서 자동 생성</div>
                <svg viewBox="0 0 96 96" style={sx.icon}><rect x="24" y="16" width="48" height="64" rx="6" fill="#fff7ed" stroke="#f3e2cf"/><path d="M34 30h28M34 42h28M34 54h18" stroke="#10b981" strokeWidth="4" /></svg>
              </div>
              <p style={sx.cardBody}>입력 데이터 기반으로 행정·공식 제출용 보고서를 자동 작성해 업무 시간을 줄여줘요.</p>
            </article>
          </div>
        </div>
      </PageNav>

      <footer style={sx.footer}>
        <Link to="/" style={sx.footerWrap}>
          <img src={zebraLogo} alt="Zebra Logo" style={sx.footerLogoImg} />
          <div>
            <div style={sx.footerTitle}>Zebra</div>
            <div style={sx.footerSub}>Zero Energy Building Reporting and Advisor</div>
          </div>
        </Link>
      </footer>
    </main>
  );
}
