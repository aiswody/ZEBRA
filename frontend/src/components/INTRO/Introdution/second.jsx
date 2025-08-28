// src/components/INTRO/second.jsx
import React from "react";
import { Link } from "react-router-dom";
import PageNav from "./pagenav";
import zebraLogo from "../../../assets/zebraLogo.png";

import img21 from "../../../assets/2-1.png";
import img22 from "../../../assets/2-2.png";
import img23 from "../../../assets/2-3.png";
import bg3 from "../../../assets/3background.png";

export default function Second() {
  const FOOTER_H = 1;

  const sx = {
    wrap: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: `80px 0 ${FOOTER_H}px`,
      backgroundColor: "#f5f7f8",
      backgroundImage: `url(${bg3})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      boxSizing: "border-box",
    },

    container: {
      width: "100%",
      maxWidth: 1560,           // 기존 유지
      margin: "0 auto",
      
      top: "150px",
      padding: "0 24px",
      boxSizing: "border-box",
    },

    sectionTitle: {
      textAlign: "center",
      fontWeight: 900,
      fontSize: 45,
      color: "#111827",
      marginBottom: 56,
    },

    grid: {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(400px, 1fr))", 
  // ← 400px → 420px, 440px 이런 식으로 늘리면 카드 가로가 더 넓어짐
  gap: 32,
  alignItems: "stretch",
  minWidth: 0,
},

    card: {
      background: "#fff",
      borderRadius: 18,
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      padding: 28,
      border: "1px solid rgba(0,0,0,0.06)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minWidth: 0,
      boxSizing: "border-box",
    },

    // 번호 → 텍스트 아래로, 둘 다 가운데정렬
    headerRow: {
      display: "flex",
      flexDirection: "column",      // ← 핵심
      alignItems: "center",
      justifyContent: "center",
      gap: 10,                      // 번호-제목 간 간격
      marginBottom: 14,
      width: "100%",
      minWidth: 0,
      textAlign: "center",
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
      fontSize: 16,
      boxShadow: "0 6px 16px rgba(16,185,129,0.35)",
      flexShrink: 0,
      alignSelf: "flex-start",   // 부모가 column flex일 때 왼쪽 정렬
    },

    cardTitle: { fontWeight: 800, fontSize: 26, color: "#111827", margin: 0 },

    cardBody: {
      fontSize: 18,
      color: "#374151",
      lineHeight: 1.8,
      minHeight: 90,
      textAlign: "center",
      marginBottom: 12,
      wordBreak: "break-word",
      overflowWrap: "anywhere",
    },

    illo: {
      width: "50%",
      maxWidth: 240,
      maxHeight: 160,
      height: "auto",
      borderRadius: 8,
      display: "block",
      margin: "14px auto 0",
      objectFit: "contain",
    },

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
    <main style={{ backgroundColor: "#f5f7f8", overflowX: "hidden" }}>
      <PageNav style={sx.wrap} prev="/first" next="/third">
        <div style={sx.container}>
          <div style={sx.sectionTitle}>
            공공건축물 관리와 온실가스 산정, 왜 지금 필요한가요?
          </div>

          <style>{`
            @media (max-width: 1280px){
  .grid { grid-template-columns: repeat(2, minmax(400px, 1fr)); }
}

            @media (max-width: 820px){
              .grid { grid-template-columns: 1fr; }
            }
          `}</style>

          <div className="grid" style={sx.grid}>
            <article style={sx.card}>
              <div style={sx.headerRow}>
                <div style={sx.badge}>1</div>
                <div style={sx.cardTitle}>노후화된 공공건축물의 에너지 비효율</div>
              </div>
              <p style={sx.cardBody}>
                국내 공공건축물의 상당수가 준공 20년 이상으로
                <br />노후화되어 있어 냉난방 효율이 낮고
                <br />에너지 소비가 증가하고 있어요.
              </p>
              <img src={img21} alt="노후화된 공공건축물" style={sx.illo} />
            </article>

            <article style={sx.card}>
              <div style={sx.headerRow}>
                <div style={sx.badge}>2</div>
                <div style={sx.cardTitle}>국가 온실가스 감축 목표 달성 필요</div>
              </div>
              <p style={sx.cardBody}>
                정부의 2030 국가 온실가스 감축 목표(NDC) 달성을 위해,
                <br />공공부문이 선도적으로
                <br />감축 성과를 내야 하는 상황이에요.
              </p>
              <img src={img22} alt="국가 온실가스 감축 목표" style={sx.illo} />
            </article>

            <article style={sx.card}>
              <div style={sx.headerRow}>
                <div style={sx.badge}>3</div>
                <div style={sx.cardTitle}>주민 생활과 직결되는 환경 개선 요구</div>
              </div>
              <p style={sx.cardBody}>
                공공건축물은 주민들이 직접 이용하는 시설이기 때문에,
                <br />친환경적이고 쾌적한 공간 조성은
                <br />지역 주민의 삶의 질 향상과도 연결돼요.
              </p>
              <img src={img23} alt="주민 생활 환경 개선" style={sx.illo} />
            </article>
          </div>
        </div>
      </PageNav>

      <footer style={sx.footer}>
        <Link to="/" style={sx.footerWrap}>
          <img src={zebraLogo} alt="Zebra Logo" style={sx.footerLogoImg} />
          <div>
            <div style={sx.footerTitle}>Zebra</div>
            <div style={sx.footerSub}>
              Zero Energy Building Reporting and Advisor
            </div>
          </div>
        </Link>
      </footer>
    </main>
  );
}
