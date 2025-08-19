// components/ALL/Sidebar/Esidebar.jsx
import React from "react";
import { Search, LayoutDashboard, Download } from "lucide-react";

// 상단 고정 헤더 높이에 맞게 조정
const HEADER_H = 120;
const TOP_SAFE = 16;

export default function Esidebar({
  activePage = "dashboard", // "dashboard" | "reports"
  setActivePage = () => {},
  profile = {
    orgName: "동국대학교",
    orgGroup: "사립대학교",
    facility: "교육연구시설",
  },
}) {
  return (
    <aside style={sx.sidebar}>
      {/* 검색 */}
      <div style={sx.searchBox}>
        <Search size={16} style={sx.searchIcon} />
        <input type="search" placeholder="검색" style={sx.searchInput} />
      </div>

      {/* Profile */}
      <div style={sx.section}>
        <div style={sx.sectionTitle}>Profile</div>
        <div style={sx.profileCard}>
          <span role="img" aria-label="building" style={sx.profileEmoji}>
            🏫
          </span>
          <span>{profile.orgName}</span>
        </div>
        <div style={sx.profileSub}>- {profile.orgGroup}</div>
        <div style={sx.profileSub}>- {profile.facility}</div>
      </div>

      <div style={sx.divider} />

      {/* Menu */}
      <div style={sx.section}>
        <div style={sx.sectionTitle}>Menu</div>

        {/* 탄소 감축 대시보드 */}
        <button
          type="button"
          onClick={() => setActivePage("dashboard")}
          style={{
            ...sx.menuItem,
            ...(activePage === "dashboard" ? sx.menuItemActive : {}),
          }}
        >
          {activePage === "dashboard" && <span style={sx.activeBar} />}
          <span style={sx.menuIcon}>
            <LayoutDashboard size={16} />
          </span>
          <span>탄소 감축 대시보드</span>
        </button>

        {/* 전체 리포트 다운로드 */}
        <button
          type="button"
          onClick={() => setActivePage("reports")}
          style={{
            ...sx.menuItem,
            ...(activePage === "reports" ? sx.menuItemActive : {}),
          }}
        >
          {activePage === "reports" && <span style={sx.activeBar} />}
          <span style={sx.menuIcon}>
            <Download size={16} />
          </span>
          <span>전체 리포트 다운로드</span>
        </button>
      </div>
    </aside>
  );
}

const LINE_HEIGHT = 1.75;

const sx = {
  sidebar: {
    position: "sticky",
    top: HEADER_H + TOP_SAFE,
    alignSelf: "start",
    width: 260,
    minHeight: `calc(100vh - ${HEADER_H}px)`,
    padding: 16,
    background: "#F4F7F6",
    borderRight: "1px solid #E5E9E7",
    overflowY: "auto",
    overflowX: "hidden", // ✅ 가로 넘침 숨김
    boxSizing: "border-box",
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
    boxSizing: "border-box", // ✅ padding 포함하여 100% 계산
    display: "block",
    maxWidth: "100%", // ✅ 부모 너비 초과 방지
    borderRadius: 12,
    border: "1px solid #D8E1DD",
    outline: "none",
    background: "#fff",
    WebkitAppearance: "none", // ✅ Safari 기본 스타일 제거
  },

  // 섹션
  section: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 },
  sectionTitle: { fontWeight: 800, fontSize: 14, color: "#111827", marginBottom: 6 },
  divider: { height: 1, background: "#E5E9E7", margin: "10px 0 14px" },

  // 프로필
  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    border: "1px solid #E5E9E7",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
  },
  profileEmoji: { width: 18, display: "flex", alignItems: "center", justifyContent: "center" },
  profileSub: { paddingLeft: 8, color: "#6B7280", fontSize: 13 },

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
    background: "transparent",
    border: "1px solid transparent",
    color: "#2A2F2C",
    fontSize: 14,
    lineHeight: LINE_HEIGHT,
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