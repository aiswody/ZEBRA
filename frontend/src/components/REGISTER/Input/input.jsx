// 사용량 입력 컨트롤러 (백엔드 연동 버전)
import React, { useEffect, useState } from 'react';
import BuildingList from './comp/buildingList';
import InfoBubble from './comp/infoBubble';
import Scope1Card from './comp/scope1Card';
import Scope2Card from './comp/scope2Card';
import AreaCard from './comp/areaCard';
import { api } from '../../../api/client'; // ← 경로 확인해서 맞추세요

const Input = () => {
  const [buildings, setBuildings] = useState([]);
  const [activeBuildingId, setActiveBuildingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // 백엔드에서 건물 목록 불러오기
  const fetchBuildings = async () => {
    const { data } = await api.get('/buildings/'); // client.js baseURL = /api
    const rows = Array.isArray(data) ? data : (data?.results || []);
    // BuildingList가 name/usageLabel/address를 쓰면 그대로 전달 가능
    return rows.map(({ id, name, usageLabel, address }) => ({
      id, name, usageLabel, address,
    }));
  };

  // 서버에서 불러온 초기 값: { [buildingId]: { scope1, scope2, area } }
  // (아직 미연동이라 빈 객체)
  const [energyDataMap] = useState({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const list = await fetchBuildings();
        if (!mounted) return;
        setBuildings(list);
        setActiveBuildingId(list?.[0]?.id ?? null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const currentInitial = energyDataMap[activeBuildingId] || null;

  return (
    <div style={styles.page}>
      <div style={styles.topRow}>
        <div style={styles.leftCol}>
          <h3 style={styles.sectionTitle}>연료 사용량 입력</h3>
          <BuildingList
            buildings={buildings}
            activeId={activeBuildingId}
            onSelect={setActiveBuildingId}
            loading={loading}
          />
        </div>

        <div style={styles.rightCol}>
          <InfoBubble />
        </div>
      </div>

      <div style={styles.bottomRow}>
        <div style={styles.bottomLeft}>
          {/* 건물 변경 시 리마운트 → 폼 초기화, 서버 값 있으면 initialValue로 hydrate */}
          <Scope1Card
            key={`s1-${activeBuildingId || 'none'}`}    // ← 문자열 템플릿 수정
            initialValue={currentInitial?.scope1}
          />
        </div>
        <div style={styles.bottomRight}>
          <Scope2Card
            key={`s2-${activeBuildingId || 'none'}`}    // ← 문자열 템플릿 수정
            initialValue={currentInitial?.scope2}
          />
          <AreaCard
            key={`area-${activeBuildingId || 'none'}`}  // ← 문자열 템플릿 수정
            initialValue={currentInitial?.area}
          />
        </div>
      </div>

      <div style={styles.footer}>
        <button type="button" style={styles.submitBtn}>
          입력 완료
        </button>
      </div>
    </div>
  );
};

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16, padding: 20 },
  topRow: { display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16, alignItems: 'start' },
  leftCol: {},
  rightCol: { display: 'flex', justifyContent: 'flex-start' },
  sectionTitle: { margin: '0 0 12px 0' },
  bottomRow: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, alignItems: 'start' },
  bottomLeft: {},
  bottomRight: { display: 'flex', flexDirection: 'column', gap: 16 },
  footer: { display: 'flex', justifyContent: 'center', marginTop: 12 },
  submitBtn: {
    minWidth: 240,
    height: 44,
    borderRadius: 10,
    border: 'none',
    background: '#166534',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default Input;