// src/components/INTRO/first.jsx
import React from "react";
import { Link } from "react-router-dom";
import PageNav from "./pagenav";
import serviceBg from "../../../assets/service.png";
import zebraLogo from "../../../assets/zebraLogo.png";

// src/components/INTRO/first.jsx
// ...상단 import 동일

export default function First() {
  const NAV_HEIGHT = 110;
  const CONTENT_OFFSET_Y = -120;

  const sx = {
    root: { backgroundColor: "#f5f7f8" },

    hero: {
  position: "relative",
  // marginTop 삭제
  height: "100dvh",
  paddingTop: NAV_HEIGHT,  // 헤더만큼 내용 내리기
  boxSizing: "border-box",
  overflow: "clip",
  border: 0,
  outline: "none",
},

bgWrap: {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  backgroundImage: `url(${serviceBg})`,
  backgroundSize: "110% auto",          // 여분
  backgroundPosition: "center -300px",
  backgroundRepeat: "no-repeat",
  opacity: 0.5,
  pointerEvents: "none",
  userSelect: "none",
},

    // 오버레이 하단 완전 투명으로 마감 → 여백처럼 보이는 잔상 제거
    overlay: {
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0.18) 65%, rgba(255,255,255,0) 100%)",
    },

    content: {
      position: "absolute",
      inset: 0,
      zIndex: 1,
      display: "grid",
      alignContent: "center",
      justifyItems: "center",
      rowGap: 24,
      transform: `translateY(${CONTENT_OFFSET_Y}px)`,
      padding: "0 24px",
      textAlign: "center",
    },

    topTitle: { fontWeight: 800, fontSize: 50, color: "#111827", margin: 0 },

    bannerBar: {
      width: "100%",
      background: "rgba(17,24,39,0.45)",
      color: "#fff",
      padding: "24px 20px",
      backdropFilter: "blur(2px)",
      boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
    },
    bannerTitle: { margin: 0, fontWeight: 900, fontSize: 35, textAlign: "center" },
    bannerSub: { margin: "12px 0 0", fontSize: 20, opacity: 0.95, textAlign: "center" },

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
    },
    footerWrap: { display: "flex", alignItems: "center", textDecoration: "none" },
    footerLogoImg: { height: 28, marginRight: 10, filter: "contrast(1.15) saturate(1.1)" },
    footerTitle: { fontWeight: "bold", fontSize: 15, color: "#111827" },
    footerSub: { fontSize: 11, color: "#6b7280", whiteSpace: "nowrap" },
  };

  return (
    <main style={sx.root}>
      <PageNav style={sx.hero} next="/second">
        <div style={sx.bgWrap} aria-hidden />
        <div style={sx.overlay} />
        <div style={sx.content}>
          <h1 style={sx.topTitle}>탄소 중립의 첫 걸음</h1>
          <div style={sx.bannerBar}>
            <h2 style={sx.bannerTitle}>데이터로 설계하는 친환경 미래</h2>
            <p style={sx.bannerSub}>건물의 에너지와 탄소를 한 번에 관리하는 스마트 솔루션</p>
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
