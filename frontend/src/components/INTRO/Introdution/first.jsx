// src/components/INTRO/first.jsx
import React from "react";
import { Link } from "react-router-dom";
import PageNav from "./pagenav";
import serviceBg from "../../../assets/service.png";
import zebraLogo from "../../../assets/zebraLogo.png";

export default function First() {
  const NAV_HEIGHT = 64;

  const sx = {
    root: { backgroundColor: "#f5f7f8" },
    hero: { position: "relative", marginTop: NAV_HEIGHT, height: 1024, paddingTop: 140 },
    bgWrap: { position: "absolute", inset: 0, zIndex: 0 },
    bg: {
      position: "absolute", inset: 0,
      backgroundImage: `url(${serviceBg})`,
      backgroundSize: "cover", backgroundPosition: "center 30%", opacity: 0.65,
    },
    overlay: {
      position: "absolute", inset: 0,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0.2) 60%, rgba(255,255,255,0.05) 100%)",
    },
    container: { position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 24px" },
    topTitle: { textAlign: "center", fontWeight: 800, fontSize: "clamp(28px,4.6vw,48px)", color: "#111827", marginBottom: 64 },
    bannerBar: {
      position: "relative", zIndex: 1, marginTop: 40, width: "100%", 
      background: "rgba(17,24,39,0.45)", color: "#fff", padding: "24px 0", backdropFilter: "blur(2px)",
      boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
    },
    bannerInner: { maxWidth: 980, margin: "0 auto", padding: "0 24px", textAlign: "center" },
    bannerTitle: { margin: 0, fontWeight: 900, fontSize: "clamp(22px,3.8vw,40px)" },
    bannerSub: { margin: "12px 0 0", fontSize: "clamp(14px,2.2vw,20px)", opacity: 0.95 },

    footer: {
      position: "fixed", left: "50%", transform: "translateX(-50%)",
      bottom: 16, zIndex: 10, background: "rgba(255,255,255,0.9)",
      borderRadius: 10, boxShadow: "0 6px 16px rgba(0,0,0,0.12)", padding: "10px 14px",
    },
    footerWrap: { display: "flex", alignItems: "center", textDecoration: "none" },
    footerLogoImg: { height: 28, marginRight: 10, filter: "contrast(1.15) saturate(1.1)" },
    footerTitle: { fontWeight: "bold", fontSize: 15, color: "#111827" },
    footerSub: { fontSize: 11, color: "#6b7280", whiteSpace: "nowrap" },
  };

  return (
    <main style={sx.root}>
      <PageNav style={sx.hero} next="/second">
        <div style={sx.bgWrap} aria-hidden>
          <div style={sx.bg} />
          <div style={sx.overlay} />
        </div>

        <div style={sx.container}>
          <h1 style={sx.topTitle}>탄소 중립의 첫 걸음</h1>
        </div>

        <div style={sx.bannerBar}>
          <div style={sx.bannerInner}>
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

