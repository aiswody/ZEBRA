// src/components/REGISTER/registerPage.jsx
// "건물 등록 및 관리" 전체 페이지 컨트롤

import React, { useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../../ALL/Sidebar/sidebar';

import Building from './buildingForm';
import Input from '../Input/input';
import Tier from '../Tier/tier';
import ManageActivities from '../Input/manage';

const RegisterPage = () => {
  const [activePage, setActivePage] = useState('building');
  const [searchParams] = useSearchParams();

  // 1) 페이지가 마운트될 때 항상 최상단으로
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 2) URL 의 ?sub=... 값 반영 + 스크롤도 최상단으로
  useEffect(() => {
    const sub = searchParams.get('sub'); // building | input | fuel | tier ...
    if (sub && sub !== activePage) {
      setActivePage(sub);
      // 상태 반영 직후 프레임에서 스크롤 올리기
      requestAnimationFrame(() => window.scrollTo(0, 0));
    }
  }, [searchParams, activePage]);

  // 3) 사이드바에서 탭을 바꿀 때도 항상 최상단으로
  const handleSetActivePage = useCallback((key) => {
    setActivePage(key);
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'building':
        return <Building />;
      case 'input':
        return <Input />;
      case 'fuel':
        return <ManageActivities />;
      case 'tier':
        return <Tier />;
      default:
        return <Building />;
    }
  };

  return (
    <div style={styles.container}>
      {/* setActivePage 대신 handleSetActivePage 전달 */}
      <Sidebar activePage={activePage} setActivePage={handleSetActivePage} />
      <div style={styles.main}>{renderPage()}</div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', marginTop: 'calc(64px + 46px)' },
  main: { flex: 1, padding: '24px', backgroundColor: '#f9f9f9', minHeight: '100vh' },
};

export default RegisterPage;
