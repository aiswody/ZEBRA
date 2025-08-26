// src/components/INTRO/second.jsx
import React from "react";
import { Link } from "react-router-dom";
import PageNav from "./pagenav";
import zebraLogo from "../../../assets/zebraLogo.png";

export default function Second() {
  const sx = {
    wrap: { minHeight: "100vh", display: "flex", alignItems: "center", padding: "80px 0", backgroundColor: "#f5f7f8" },
    container: { maxWidth: 1200, margin: "0 auto", padding: "0 24px", width: "100%" },
 sectionTitle: { textAlign: "center", fontWeight: 900, fontSize: "clamp(24px,4.2vw,44px)", color: "#111827", margin: 0 },
sectionTitleBottom: {
  textAlign: "center",
  fontWeight: 900,
  fontSize: "clamp(24px,4.2vw,44px)",
  color: "#111827",
  margin: 0,
  marginBottom: 32, // ← 이 값으로 아래 여백만 조절
},

    titleSpacer: { height: 12 },
    grid: { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 28 },
    card: { background: "#fff", borderRadius: 18, boxShadow: "0 10px 30px rgba(0,0,0,0.08)", padding: 24, border: "1px solid rgba(0,0,0,0.06)" },
    badge: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 10, background: "#10b981", color: "#fff", fontWeight: 800, marginBottom: 14, boxShadow: "0 6px 16px rgba(16,185,129,0.35)" },
    cardTitle: { fontWeight: 800, fontSize: 18, color: "#111827", marginBottom: 10 },
    cardBody: { fontSize: 14, color: "#374151", lineHeight: 1.7, minHeight: 72 },
    illo: { width: "100%", height: 220, marginTop: 12 },

    footer: { position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 16, zIndex: 10, background: "rgba(255,255,255,0.9)", borderRadius: 10, boxShadow: "0 6px 16px rgba(0,0,0,0.12)", padding: "10px 14px" },
    footerWrap: { display: "flex", alignItems: "center", textDecoration: "none" },
    footerLogoImg: { height: 28, marginRight: 10, filter: "contrast(1.15) saturate(1.1)" },
    footerTitle: { fontWeight: "bold", fontSize: 15, color: "#111827" },
    footerSub: { fontSize: 11, color: "#6b7280", whiteSpace: "nowrap" },
  };

  return (
    <main style={{ backgroundColor: "#f5f7f8" }}>
      <PageNav style={sx.wrap} prev="/" next="/third">
        <div style={sx.container}>
        <div style={sx.sectionTitle}>공공건축물 관리와 온실가스 산정,</div>
        <div style={sx.sectionTitleBottom}>왜 지금 필요한가요?</div>

          <style>{`@media (max-width:1024px){ .grid { grid-template-columns: 1fr; } }`}</style>
          <div className="grid" style={sx.grid}>
            <article style={sx.card}>
              <div style={sx.badge}>1</div>
              <div style={sx.cardTitle}>노후화된 공공건축물의 에너지 비효율</div>
              <p style={sx.cardBody}>국내 공공건축물의 상당수가 준공 20년 이상으로 
  <br />노후화되어 있어 냉난방 효율이 낮고 
  <br />에너지 소비가 증가하고 있어요.</p>
              <svg viewBox="0 0 400 260" style={sx.illo}><rect x="48" y="140" width="190" height="90" rx="6" fill="#dbeafe" /></svg>
            </article>

            <article style={sx.card}>
              <div style={sx.badge}>2</div>
              <div style={sx.cardTitle}>국가 온실가스 감축 목표 달성 필요</div>
              <p style={sx.cardBody}>정부의 2030 국가 온실가스 감축 목표(NDC) 달성을 
위해, 공공부문이 선도적으로 
감축 성과를 내야 하는 상황이에요.</p>
              <svg viewBox="0 0 400 260" style={sx.illo}><rect x="40" y="210" width="320" height="12" fill="#e5e7eb" /></svg>
            </article>

            <article style={sx.card}>
              <div style={sx.badge}>3</div>
              <div style={sx.cardTitle}>주민 생활과 직결되는 환경 개선 요구</div>
              <p style={sx.cardBody}>공공건축물은 주민들이 직접 이용하는 시설이기 때문에, 
  <br />친환경적이고 쾌적한 공간 조성은 
지역 주민의   <br />삶의 질 향상과도 연결돼요.</p>
              <svg viewBox="0 0 400 260" style={sx.illo}><rect x="60" y="70" width="280" height="150" rx="12" fill="#fef3c7" /></svg>
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
