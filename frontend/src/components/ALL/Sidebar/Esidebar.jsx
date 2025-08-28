// components/ALL/Sidebar/Esidebar.jsx
import React from "react";
import { Search, LayoutDashboard, Download } from "lucide-react";
import ProfileCard from "../Profile/profile";

const HEADER_H = 64;
const TOP_SAFE  = 62;   // 너가 맞춘 값 유지

export default function Esidebar({
  activePage = "dashboard",
  setActivePage = () => {},
}) {
  return (
    <aside style={sx.sidebar}>
      {/* 상단 여유 */}
      <div style={{ height: TOP_SAFE }} />

      {/* 검색 */}
      <div style={sx.searchBox}>
        <Search size={16} style={sx.searchIcon} />
        <input type="search" placeholder="검색" style={sx.searchInput} />
      </div>

      {/* ProfileCard - Sidebar.jsx와 동일 프롭 사용 + marginBottom 제거 */}
      <div style={sx.profileWrap}>
        <ProfileCard
          variant="sidebar"
          showActions={false}
          containerStyle={{ width: "100%", textAlign: "left", marginBottom: 0 }}
        />
      </div>

      {/* Menu - 프로필 아래 간격을 우리가 정확히 통제 */}
      <div style={sx.menuBlock}>
        <div style={sx.sectionTitle}>Menu</div>

        <button
          type="button"
          onClick={() => setActivePage("dashboard")}
          style={{
            ...sx.menuItem,
            ...(activePage === "dashboard" ? sx.menuItemActive : {}),
          }}
        >
          {activePage === "dashboard" && <span style={sx.activeBar} />}
          <span style={sx.menuIcon}><LayoutDashboard size={16} /></span>
          <span>탄소 감축 대시보드</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePage("reports")}
          style={{
            ...sx.menuItem,
            ...(activePage === "reports" ? sx.menuItemActive : {}),
          }}
        >
          {activePage === "reports" && <span style={sx.activeBar} />}
          <span style={sx.menuIcon}><Download size={16} /></span>
          <span>전체 리포트 다운로드</span>
        </button>
      </div>
    </aside>
  );
}

const sx = {
  sidebar: {
    position: "sticky",
    top: HEADER_H,
    alignSelf: "start",
    width: 260,
    minHeight: `calc(100vh - ${HEADER_H}px)`,
    padding: 16,
    background: "#F4F7F6",
    borderRight: "1px solid #E5E9E7",
    overflowY: "auto",
    overflowX: "hidden",
    boxSizing: "border-box",

    // ✅ 부모 gap 제거: 간격은 각 요소 margin으로만 통제
    display: "flex",
    flexDirection: "column",
    gap: 0,
    textAlign: "left",
  },

  // 검색
  searchBox: { position: "relative", marginBottom: 16, width: "100%" },
  searchIcon: {
    position: "absolute",
    left: 8,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9AA39F",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    height: 40,
    padding: "0 12px 0 36px",
    boxSizing: "border-box",
    display: "block",
    maxWidth: "100%",
    borderRadius: 12,
    border: "1px solid #D8E1DD",
    outline: "none",
    background: "#fff",
    WebkitAppearance: "none",
  },

  // ✅ 프로필 아래 간격은 명시적으로 지정 (Sidebar.jsx 대비 정확히 동일)
  profileWrap: {
    width: "100%",
    marginBottom: 16,    // ← 여기 값이 '검색창 ↔ Menu' 거리의 핵심
  },

  // ✅ Menu 블록의 상단 여백은 0 (프로필에서만 간격 관리)
  menuBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 12,             // 메뉴 항목 사이 간격 (Sidebar.jsx의 ITEM_GAP=12와 동일)
    marginTop: 0,
  },
  sectionTitle: {
    fontWeight: 800,
    fontSize: 14,
    color: "#111827",
    margin: 0,
    marginTop: 3,
    marginBottom: 6,
  },

  // 메뉴
  menuItem: {
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: 10,
  height: 44,
  padding: "0 12px",
  borderRadius: 10,
  textAlign: "left",

  // 기본 버튼 스타일 리셋 🔧
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  backgroundColor: "transparent",
  border: "1px solid transparent",
  outline: "none",

  color: "#2A2F2C",
  fontSize: 14,
  lineHeight: "normal",
  cursor: "pointer",
},
  menuItemActive: {
    backgroundColor: "#E6F4EA",
    border: "1px solid #CFE4D8",
    color: "#124C33",
    fontWeight: 700,
  },
  activeBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: "10px 0 0 10px",
    background: "#1F7A43",
  },
  menuIcon: {
    width: 18,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
