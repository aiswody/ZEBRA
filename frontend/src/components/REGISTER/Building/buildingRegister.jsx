// "건물 등록 및 관리" 전체 페이지 컨트롤

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';   // ✅ 추가
import Sidebar from '../../ALL/Sidebar/sidebar';

import Building from './buildingForm';
import Input from '../Input/input';
import Tier from '../Tier/tier';
import ManageActivities from '../Input/manage';

const RegisterPage = () => {
  const [activePage, setActivePage] = useState('building');
  const [searchParams] = useSearchParams();           // ✅ 추가

  // ✅ URL ?sub=... 값이 있으면 탭 반영
  useEffect(() => {
    const sub = searchParams.get('sub');              // building | input | fuel | tier ...
    if (sub) setActivePage(sub);
  }, [searchParams]);

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
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div style={styles.main}>{renderPage()}</div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', marginTop: 'calc(64px + 46px)' },
  main: { flex: 1, padding: '24px', backgroundColor: '#f9f9f9', minHeight: '100vh' },
};

export default RegisterPage;
