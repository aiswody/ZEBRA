import React, { useState } from "react";
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

  const [data, setData] = useState({}); // 서버 응답 모음

  const fetchAll = async (bid, y) => {
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
        useTotal,
        useS1,
        useS2,
      ] = await Promise.all([
        getTotalTab(bid, y),
        getScope1Tab(bid, y),
        getScope2Tab(bid, y),
        getScope1BuildingsCompare(y),
        getScope2BuildingsCompare(y),
        getScopeRatio(bid, y),
        getYearlyTrend(bid, y, "total"),
        getYearlyTrend(bid, y, "scope1"),
        getYearlyTrend(bid, y, "scope2"),
        getUseCompare(bid, y, "total"),
        getUseCompare(bid, y, "scope1"),
        getUseCompare(bid, y, "scope2"),
      ]);

      setData({
        total: totalRes.data,                       // { summary, per_area_radar }
        scope1: { ...s1Res.data, compare: s1Compare.data, useCompare: useS1.data, trend: trendS1Res.data },
        scope2: { ...s2Res.data, compare: s2Compare.data, useCompare: useS2.data, trend: trendS2Res.data },
        ratio: ratioRes.data,
        trendTotal: trendTotalRes.data,
        useTotal: useTotal.data,
      });
    } catch (e) {
      console.error("대시보드 데이터 로드 실패:", e);
      setData({});
    }
  };

  const handleSelectBuilding = (bid) => {
    setBuildingId(bid);
    fetchAll(bid, year);
  };

  const renderTabView = () => {
    if (!buildingId) return <p>건물을 선택하세요.</p>;

    switch (tab) {
      case "scope1":
        return <Scope1Emission {...data.scope1} />;
      case "scope2":
        return <Scope2Emission {...data.scope2} />;
      case "total":
      default:
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
