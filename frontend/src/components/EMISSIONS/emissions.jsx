// components/EMISSIONS/emissions.jsx
import React, { useMemo, useState } from "react";
import Esidebar from "../ALL/Sidebar/Esidebar";

import DashboardHeader from "./Emissions/dashboardHeader";
import EmissionTabs from "./Emissions/emissionTabs";
import TotalEmission from "./Emissions/totalEmission";
import Scope1Emission from "./Emissions/scope1Emission";
import Scope2Emission from "./Emissions/scope2Emission";

// NOTE: ReportsDownload 경로는 실제 위치에 맞게 유지/수정하세요.
// 예시1) 같은 폴더 구조라면: "./Reports/reportsDownload"
// 예시2) 전역 REPORTS 폴더라면: "../REPORTS/reportsDownload"
import ReportsDownload from "./Reports/reportsDownload";

import { layout, contentCard } from "./Emissions/emission.styles";

export default function Emissions({
  // 새 파라미터 (선택): 사이드바 기본 섹션과 탭 기본값
  initialSection = "dashboard", // "dashboard" | "reports"
  initialTab,
  // 과거 호환용: 탭 기본값 (total/scope1/scope2)
  initialActive = "total",
  // 공통 핸들러
  fetchEmissions,
  onExport,
  permissions = { canExport: true },
}) {
  // 사이드바 섹션 상태 (대시보드/리포트)
  const [section, setSection] = useState(initialSection);
  // 대시보드 내부 탭 상태
  const [tab, setTab] = useState(initialTab ?? initialActive);

  // 자식들에 내려줄 공통 props
  const sharedProps = useMemo(
    () => ({ fetchEmissions, onExport, permissions }),
    [fetchEmissions, onExport, permissions]
  );

  // 탭별 렌더
  const renderTabView = () => {
    switch (tab) {
      case "scope1":
        return <Scope1Emission {...sharedProps} />;
      case "scope2":
        return <Scope2Emission {...sharedProps} />;
      case "total":
      default:
        return <TotalEmission {...sharedProps} />;
    }
  };

  return (
    <div style={{ ...layout.container, textAlign: 'left', alignItems: 'flex-start' }}>
      <Esidebar activePage={section} setActivePage={setSection} />
      <main style={layout.main}>
        {section === "dashboard" ? (
          <>
            <DashboardHeader />
            <EmissionTabs active={tab} onChange={setTab} />
            <section style={contentCard}>{renderTabView()}</section>
          </>
        ) : (
          <ReportsDownload
            onDownload={(fmt, scope, years, orgId, buildingId) =>
              onExport?.({ scope, yearRange: years, orgId, buildingId }, fmt)
            }
          />
        )}
      </main>
    </div>
  );
}