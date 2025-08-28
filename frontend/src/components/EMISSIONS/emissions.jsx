// components/EMISSIONS/emissions.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import Esidebar from "../ALL/Sidebar/Esidebar";

import DashboardHeader from "./Emissions/dashboardHeader";
import EmissionTabs from "./Emissions/emissionTabs";
import TotalEmission from "./Emissions/totalEmission";
import Scope1Emission from "./Emissions/scope1Emission";
import Scope2Emission from "./Emissions/scope2Emission";
import ReportsDownload from "./Reports/reportsDownload";

import { layout, contentCard } from "./Emissions/emission.styles";

import {
  getTotalTab,
  getScope1Tab,
  getScope2Tab,
  getScope1BuildingsCompare,
  getScope2BuildingsCompare,
  getScopeRatio,
  getYearlyTrend,
  getUseCompare,
} from "../../api/emissions";

export default function Emissions({
  initialSection = "dashboard",
  initialActive = "total",
}) {
  const [section, setSection] = useState(initialSection);
  const [tab, setTab] = useState(initialActive);
  const [buildingId, setBuildingId] = useState(null);
  const [year] = useState(new Date().getFullYear());

  const [data, setData] = useState({
    total: null,
    scope1: null,
    scope2: null,
    ratio: null,
    trendTotal: null,
    useTotal: null,
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // 동시에 여러 번 눌러도 마지막 요청만 반영되도록 요청 토큰
  const reqTokenRef = useRef(0);

  const fetchAll = useCallback(async (rawBid, y) => {
    const bid = Number(rawBid);
    if (!bid || !y) return;

    const myToken = ++reqTokenRef.current;
    setLoading(true);
    setErr(null);

    try {
      const [
        totalRes,
        s1Res,
        s2Res,
        s1Compare,
        s2Compare,
        ratioRes,
        trendTotalRes,
        trendS1Res,
        trendS2Res,
        useTotalRes,
        useS1Res,
        useS2Res,
      ] = await Promise.all([
        getTotalTab(bid, y),                 // { summary, per_area_radar }
        getScope1Tab(bid, y),               // { summary, by_fuel, per_area }
        getScope2Tab(bid, y),               // { summary, per_area }
        getScope1BuildingsCompare(y),       // { year, items: [...] }
        getScope2BuildingsCompare(y),       // { year, items: [...] }
        getScopeRatio(bid, y),              // { scope1_kg, scope2_kg, ... }
        getYearlyTrend(bid, y, "total"),    // { x_axis, series, unit }
        getYearlyTrend(bid, y, "scope1"),
        getYearlyTrend(bid, y, "scope2"),
        getUseCompare(bid, y, "total"),     // { building: {intensity}, category_avg: {intensity} }
        getUseCompare(bid, y, "scope1"),
        getUseCompare(bid, y, "scope2"),
      ]);

      // 취소/경합 방지: 내가 마지막 요청이 아니면 무시
      if (myToken !== reqTokenRef.current) return;

      setData({
        total: totalRes?.data ?? null,
        scope1: {
          ...(s1Res?.data ?? {}),
          compare: s1Compare?.data ?? { items: [] },
          useCompare: useS1Res?.data ?? null,
          trend: trendS1Res?.data ?? null,
        },
        scope2: {
          ...(s2Res?.data ?? {}),
          compare: s2Compare?.data ?? { items: [] },
          useCompare: useS2Res?.data ?? null,
          trend: trendS2Res?.data ?? null,
        },
        ratio: ratioRes?.data ?? null,
        trendTotal: trendTotalRes?.data ?? null,
        useTotal: useTotalRes?.data ?? null,
      });
    } catch (e) {
      console.error("대시보드 데이터 로드 실패:", e);
      setErr("데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      setData({
        total: null,
        scope1: null,
        scope2: null,
        ratio: null,
        trendTotal: null,
        useTotal: null,
      });
    } finally {
      if (reqTokenRef.current === myToken) {
        setLoading(false);
      }
    }
  }, []);

  // Header에서 건물 선택 시 호출
  const handleSelectBuilding = useCallback((bid) => {
    const idNum = Number(bid);
    setBuildingId(idNum || null);
    if (idNum) fetchAll(idNum, year);
  }, [fetchAll, year]);

  // 만약 year 변경 UI가 생긴다면, 아래처럼 다시 로드
  useEffect(() => {
    if (buildingId) fetchAll(buildingId, year);
  }, [buildingId, year, fetchAll]);

    // 등록 화면에서 쏘는 새로고침 이벤트 수신 → 즉시 재조회
  useEffect(() => {
    const handler = (e) => {
      const { buildingId: bid = buildingId, year: y = year } = e.detail || {};
      if (bid) fetchAll(bid, y);
    };
    window.addEventListener('dashboard:refresh', handler);
    return () => window.removeEventListener('dashboard:refresh', handler);
  }, [buildingId, year, fetchAll]);
  const renderTabView = () => {
    if (!buildingId)
      return <p>건물을 선택하세요.</p>;

    if (loading)
      return <p>불러오는 중…</p>;

    if (err)
      return <p style={{ color: "crimson" }}>{err}</p>;

    switch (tab) {
      case "scope1":
        // scope1: { summary, by_fuel, per_area, compare, useCompare, trend }
        return <Scope1Emission {...data.scope1} />;
      case "scope2":
        // scope2: { summary, per_area, compare, useCompare, trend }
        return <Scope2Emission {...data.scope2} />;
      case "total":
      default:
        // total: { summary, per_area_radar }, trendTotal, ratio
        return (
          <TotalEmission
            {...data.total}
            trend={data.trendTotal}
            ratio={data.ratio}
          />
        );
    }
  };

  return (
    <div style={{ ...layout.container, textAlign: "left", alignItems: "flex-start" }}>
      <Esidebar activePage={section} setActivePage={setSection} />
      <main style={layout.main}>
        {section === "dashboard" ? (
          <>
            <DashboardHeader onSelectBuilding={handleSelectBuilding} />
            <EmissionTabs active={tab} onChange={setTab} />
            <section style={contentCard}>{renderTabView()}</section>
          </>
        ) : (
          <ReportsDownload />
        )}
      </main>
    </div>
  );
}
