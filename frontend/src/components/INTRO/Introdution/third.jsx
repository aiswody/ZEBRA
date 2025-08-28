// src/components/INTRO/third.jsx
import React from "react";
import { Link } from "react-router-dom";
import PageNav from "./pagenav";
import zebraLogo from "../../../assets/zebraLogo.png";

// 이미지 import 추가
import img31 from "../../../assets/3-1.png";
import img32 from "../../../assets/3-2.png";
import img33 from "../../../assets/3-3.png";
import img34 from "../../../assets/3-4.png";
import bg3 from "../../../assets/3background.png";

export default function Third() {
  const FOOTER_H = 1;

  const sx = {
    main: { backgroundColor: "#f5f7f8", overflowX: "hidden" },
    wrap: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: `80px 0 ${FOOTER_H}px`,
      background:
        "radial-gradient(1400px 600px at 100% -100px, rgba(16,185,129,0.08), transparent 60%), #f5f7f8",
      boxSizing: "border-box",
      backgroundImage: `url(${bg3})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    },

    container: {
      maxWidth: 1200, // 카드가 커지니까 컨테이너도 조금 넓힘
      margin: "0 auto",
      padding: "0 24px",
      width: "100%",
      boxSizing: "border-box",
      minWidth: 0,
    },
    title: {
  textAlign: "center",
  fontWeight: 900,
  fontSize: "45px",   // 👈 글자 크기 고정
  lineHeight: "80px", // 👈 줄 높이 = 박스 높이
  height: "80px",     // 👈 전체 높이 80px로 고정
  color: "#111827",
  marginBottom: 56,
},
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(2,minmax(0,1fr))",
      gap: 32, // 카드 간격 더 넓힘
      minWidth: 0,
    },
    card: {
  background: "#fff",
  borderRadius: 22,
  boxShadow: "0 12px 36px rgba(0,0,0,0.1)",
  padding: "20px 24px",   // 👈 세로 패딩 ↓ (36 → 20, 좌우는 24 유지)
  border: "1px solid rgba(0,0,0,0.06)",
  minHeight: 240,         // 👈 최소 높이도 조금 줄임 (280 → 240)
  minWidth: 0,
  boxSizing: "border-box",
},



    row: {
      display: "grid",
      gridTemplateColumns: "auto 1fr auto",
      alignItems: "center",
      gap: 20,
      minWidth: 0,
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 42,  // 배지 크기 ↑
      height: 42,
      borderRadius: 12,
      background: "#10b981",
      color: "#fff",
      fontWeight: 800,
      fontSize: 18,
      boxShadow: "0 6px 16px rgba(16,185,129,0.35)",
    },
    cardTitle: { fontWeight: 800, fontSize: 26, color: "#111827" }, // 제목 크게
cardBody: {
  fontSize: 18,  // 본문도 조금 키움
  color: "#374151",
  lineHeight: 1.8,
  marginTop: 16,
  wordBreak: "break-word",
  overflowWrap: "anywhere",
},

    icon: { width: 90, height: 90, flexShrink: 0, objectFit: "contain" }, // 아이콘 크게

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
                <img src={img31} alt="자동 탄소 배출량 산정" style={sx.icon} />
              </div>
              <p style={sx.cardBody}>
                에너지 사용 데이터를 입력하면, 국제·국내 기준(환경부, IPCC, <br />K-GHG 등)에 맞춰 자동으로 배출량을 산정해줘요.
              </p>
            </article>

            <article style={sx.card}>
              <div style={sx.row}>
                <div style={sx.badge}>2</div>
                <div style={sx.cardTitle}>에너지 현황 대시보드</div>
                <img src={img32} alt="에너지 현황 대시보드" style={sx.icon} />
              </div>
              <p style={sx.cardBody}>
                기관별 추이를 대시보드로 비교 분석해 <br />현황을 쉽게 파악할 수 있어요.
              </p>
            </article>

            <article style={sx.card}>
              <div style={sx.row}>
                <div style={sx.badge}>3</div>
                <div style={sx.cardTitle}>감축 시뮬레이션 및 대안 제시</div>
                <img src={img33} alt="감축 시뮬레이션 및 대안 제시" style={sx.icon} />
              </div>
              <p style={sx.cardBody}>
                재생에너지 도입, 설비 교체, 효율 개선 등 시나리오로 예상 효과를 시뮬레이션하고 대안을 추천해줘요.
              </p>
            </article>

            <article style={sx.card}>
              <div style={sx.row}>
                <div style={sx.badge}>4</div>
                <div style={sx.cardTitle}>보고서 자동 생성</div>
                <img src={img34} alt="보고서 자동 생성" style={sx.icon} />
              </div>
              <p style={sx.cardBody}>
                입력 데이터 기반으로 행정·공식 제출용 보고서를 <br />자동 작성해 업무 시간을 줄여줘요.
              </p>
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
