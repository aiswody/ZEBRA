// 사이드바

import React from "react";
import { Building2, ClipboardList, Flame, Search } from "lucide-react";
import ProfileCard from "../Profile/profile";

const HEADER_H = 64;
const TOP_SAFE = 16;
const ITEM_GAP = 12;
const LINE_HEIGHT = 1.75;

export default function Sidebar({ activePage, setActivePage }) {
  const isGroupActive = activePage === "building" || activePage === "input";

  return (
    <aside style={sx.sidebar}>
      <div style={{ height: TOP_SAFE }} />

      {/* 검색 */}
      <div style={sx.searchBox}>
        <Search size={16} style={sx.searchIcon} />
        <input type="search" placeholder="검색" style={sx.searchInput} />
      </div>

      {/* 프로필 */}
      <div style={sx.profileWrap}>
        <ProfileCard
          variant="sidebar"
          showActions={false}
          containerStyle={{ width: "100%", textAlign: "left", marginBottom: 6 }}
        />
      </div>

      <h4 style={sx.title}>Menu</h4>

      {/* 메뉴 */}
      <nav style={sx.group}>
        {/* 그룹: 건물 정보 통합 등록 */}
        <button
          type="button"
          onClick={() =>
            setActivePage(isGroupActive ? activePage : "building")
          }
          style={{
            ...(isGroupActive ? sx.menuItemActive : sx.menuItem),
            ...sx.firstMenuItem, // ✅ 첫 번째 메뉴만 아래로 내림
          }}
        >
          {isGroupActive && <span style={sx.activeBar} />}
          <span style={sx.menuIcon}><Building2 size={16} /></span>
          <span>건물 정보 통합 등록</span>
        </button>

        {/* 하위 항목 */}
        <div style={sx.childWrap}>
          <button
            type="button"
            onClick={() => setActivePage("building")}
            style={activePage === "building" ? sx.childActive : sx.child}
          >
            - 건물 등록
          </button>
          <button
            type="button"
            onClick={() => setActivePage("input")}
            style={activePage === "input" ? sx.childActive : sx.child}
          >
            - 연료 사용량 입력
          </button>
        </div>

        {/* 그룹: Tier 설문 */}
        <button
          type="button"
          onClick={() => setActivePage("tier")}
          style={activePage === "tier" ? sx.menuItemActive : sx.menuItem}
        >
          {activePage === "tier" && <span style={sx.activeBar} />}
          <span style={sx.menuIcon}><ClipboardList size={16} /></span>
          <span>Tier 설문</span>
        </button>

        {/* 그룹: 사용량 관리 */}
        <button
          type="button"
          onClick={() => setActivePage("fuel")}
          style={activePage === "fuel" ? sx.menuItemActive : sx.menuItem}
        >
          {activePage === "fuel" && <span style={sx.activeBar} />}
          <span style={sx.menuIcon}><Flame size={16} /></span>
          <span>사용량 관리</span>
        </button>
      </nav>
    </aside>
  );
}

const sx = {
  // 검색
  searchBox: { position: "relative", paddingBottom: 16, width: "100%" },
  searchIcon: {
    position: "absolute",
    left: 8,
    top: 20,
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

  sidebar: {
    width: 260,
    backgroundColor: "#F4F7F6",
    borderRight: "1px solid #E5E9E7",
    boxSizing: "border-box",
    padding: 16,
    position: "sticky",
    top: HEADER_H,
    alignSelf: "start",
    minHeight: `calc(100vh - ${HEADER_H}px)`,
    overflowY: "auto",
  },

  // 프로필 아래 간격 고정
  profileWrap: {
    paddingBottom: 16,
    width: "100%",
    display: "flow-root",
  },

  title: {
    margin: 0,
    marginTop: 1,
    marginBottom: 13,
    fontSize: 14,
    fontWeight: 800,
    lineHeight: LINE_HEIGHT,
  },

  group: {
    display: "flex",
    flexDirection: "column",
    gap: ITEM_GAP,
  },

  /* ✅ 버튼 베이스/액티브 스타일 */
  menuItem: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 10,
    height: 44,
    padding: "8px 12px",
    borderRadius: 10,
    textAlign: "left",
    background: "transparent",
    border: "1px solid transparent",
    color: "#2A2F2C",
    fontSize: 14,
    lineHeight: "normal",
    cursor: "pointer",
  },
  menuItemActive: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 10,
    height: 44,
    padding: "8px 12px",
    borderRadius: 10,
    textAlign: "left",
    backgroundColor: "#E6F4EA",
    border: "1px solid #CFE4D8",
    color: "#124C33",
    fontSize: 14,
    fontWeight: 700,
    lineHeight: "normal",
    cursor: "pointer",
  },

  /* ✅ 첫 번째 메뉴 전용 스타일 */
  firstMenuItem: {
    marginTop: 3, // ← 숫자 조절하면 아래로 더 내림
  },

  /* 왼쪽 초록 액티브 바 */
  activeBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: "10px 0 0 10px",
    background: "#1F7A43",
  },

  /* 아이콘 영역 고정폭 */
  menuIcon: {
    width: 18,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // 하위 항목
  childWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    paddingLeft: 22,
    marginTop: 6,
  },
  child: {
    all: "unset",
    color: "#9AA39F",
    fontSize: 14,
    cursor: "pointer",
    lineHeight: LINE_HEIGHT,
    padding: "4px 2px",
  },
  childActive: {
    all: "unset",
    color: "#124C33",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    lineHeight: LINE_HEIGHT,
    padding: "4px 2px",
  },
};
