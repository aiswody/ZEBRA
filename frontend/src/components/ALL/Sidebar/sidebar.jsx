// 사이드바

import React from "react";
import { Building2, ClipboardList, Flame } from "lucide-react"; // 아이콘 불러오기
import { Search, LayoutDashboard, Download } from "lucide-react";
import ProfileCard from '../Profile/profile';

const HEADER_H = 64;
const TOP_SAFE = 16;
const ITEM_GAP = 12;
const LINE_HEIGHT = 1.75;

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <aside style={sx.sidebar}>
      <div style={{ height: TOP_SAFE }} />

      {/* 검색 */}
      <div style={sx.searchBox}>
        <Search size={16} style={sx.searchIcon} />
        <input type="search" placeholder="검색" style={sx.searchInput} />
      </div>

      <ProfileCard variant="sidebar" showActions={false} />

      <h4 style={sx.title}>Menu</h4>

      {/* 메뉴 */}
      <nav style={sx.group}>
        {/* 그룹: 건물 정보 통합 등록 */}
        <button
          type="button"
          onClick={() => setActivePage(activePage === "building" || activePage === "input" ? activePage : "building")}
          style={(activePage === "building" || activePage === "input") ? sx.activeItem : sx.item}
        >
          <span style={sx.itemIcon}><Building2 size={16} /></span>
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
            - 연소 사용량 입력
          </button>
        </div>

        {/* 그룹: Tier 설문 */}
        <button
          type="button"
          onClick={() => setActivePage("tier")}
          style={activePage === "tier" ? sx.activeItem : sx.item}
        >
          <span style={sx.itemIcon}><ClipboardList size={16} /></span>
          <span>Tier 설문</span>
        </button>

        {/* 그룹: 기타 예시 (추가 가능) */}
        <button
          type="button"
          onClick={() => setActivePage("fuel")}
          style={activePage === "fuel" ? sx.activeItem : sx.item}
        >
          <span style={sx.itemIcon}><Flame size={16} /></span>
          <span>연료 사용량 관리</span>
        </button>
      </nav>
    </aside>
  );
}

const sx = {
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
  sidebar: {
    width: 260,
    backgroundColor: "#F4F7F6",
    borderRight: "1px solid #E5E9E7",
    boxSizing: "border-box",
    padding: "16px",
    position: "sticky",
    top: HEADER_H,
    alignSelf: "start",
    minHeight: `calc(100vh - ${HEADER_H}px)`,
    overflowY: "auto",
  },
  title: {
    margin: 0,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 700,
    lineHeight: LINE_HEIGHT,
  },
  group: {
    display: "flex",
    flexDirection: "column",
    gap: ITEM_GAP,
  },
  item: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 8,
    cursor: "pointer",
    textAlign: "left",
    background: "transparent",
    border: "1px solid transparent",
    color: "#2A2F2C",
    fontSize: 14,
    lineHeight: LINE_HEIGHT,
  },
  activeItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 8,
    cursor: "pointer",
    textAlign: "left",
    backgroundColor: "#DDEBE3",
    border: "1px solid #CFE4D8",
    color: "#124C33",
    fontSize: 14,
    fontWeight: 700,
    lineHeight: LINE_HEIGHT,
    boxShadow: "inset 0 0 0 1px #DDEBE3",
  },
  itemIcon: {
    width: 18,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
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