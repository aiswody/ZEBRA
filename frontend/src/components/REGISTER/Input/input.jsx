import React, { useEffect, useMemo, useState } from 'react';
import BuildingList from './comp/buildingList';
import InfoBubble from './comp/infoBubble';
import Scope1Card from './comp/scope1Card';
import Scope2Card from './comp/scope2Card';
import AreaCard from './comp/areaCard';
import { api } from '../../../api/client';

const yearOptions = (() => {
  const now = new Date().getFullYear();
  return [now, now - 1, now - 2];
})();

const Input = () => {
  const [buildings, setBuildings] = useState([]);
  const [activeBuildingId, setActiveBuildingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [year, setYear] = useState(new Date().getFullYear());

  // 초깃값(서버에서 가져온 저장값)과, 편집 중 데이터(draft)
  const [initialS1, setInitialS1] = useState(null);
  const [initialS2, setInitialS2] = useState(null);
  const [initialArea, setInitialArea] = useState(null);

  const [draftS1, setDraftS1] = useState(null);
  const [draftS2, setDraftS2] = useState(null);
  const [draftArea, setDraftArea] = useState(null);

  // ---- 건물 목록 ----
  const fetchBuildings = async () => {
    const { data } = await api.get('/buildings/');
    const rows = Array.isArray(data) ? data : (data?.results || []);
    return rows.map(({ id, name, usageLabel, address }) => ({ id, name, usageLabel, address }));
  };

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

  // ---- 단일 건물 저장값 조회 ----
  const fetchDetail = async (bId, y) => {
    if (!bId || !y) return { scope1: {}, scope2: {}, areas: null };
    const { data } = await api.get(`/activities/buildings/${bId}/detail`, { params: { year: y } });
    // data: { scope1: {solid:{tier,unit,amounts,ef,cv}...}, scope2:{electricity:{kwhs}}, areas:{gross,conditioned}}
    return data;
  };

  // 건물/연도 변경 시 서버값 불러와서 카드들의 initialValue로 주입
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!activeBuildingId) return;
      try {
        const d = await fetchDetail(activeBuildingId, year);

        // Scope1 카드가 기대하는 initialValue 형태로 변환
        const toTierInit = (cat) => {
          if (!cat) return null;
          const [amountOne = ""] = cat.amounts || [];
          // ef/cv 키 변환
          const sectionValues = {};
          if (cat.emission_factor != null) sectionValues.ef = cat.emission_factor.toString();
          if (cat.calorific_value != null) sectionValues.ncv = cat.calorific_value.toString();
          return {
            tier: cat.tier,
            unit: cat.unit,
            sectionValues,
            rows: [{ id: 1, fuelType: '', amount: amountOne?.toString?.() ?? '' }],
          };
        };

        setInitialS1({
          solid: toTierInit(d.scope1?.solid) || null,
          liquid: toTierInit(d.scope1?.liquid) || null,
          gas: toTierInit(d.scope1?.gas) || null,
        });
        setInitialS2({
          meters: (d.scope2?.electricity?.kwhs?.length)
            ? d.scope2.electricity.kwhs.map((k, i) => ({ id: i + 1, name: '', kwh: k?.toString?.() ?? '' }))
            : [{ id: 1, name: '', kwh: '' }],
        });
        setInitialArea(d.areas ? {
          gross: d.areas.gross?.toString?.() ?? '',
          conditioned: d.areas.conditioned?.toString?.() ?? '',
        } : null);

        // 드래프트 초기화
        setDraftS1(null);
        setDraftS2(null);
        setDraftArea(null);
      } catch (e) {
        console.error('상세 조회 실패', e);
      }
    })();
    return () => { mounted = false; };
  }, [activeBuildingId, year]);

  // 제출 payload 조합
  const payload = useMemo(() => {
    const s1 = draftS1 || {};
    const norm = (x) => (x === '' || x == null) ? null : Number(x);

    const s1Payload = {};
    const put = (key, v) => {
      if (!v) return;
      const amounts = (v.amounts || []).map(norm).filter((n) => typeof n === 'number' && !Number.isNaN(n));
      const body = {
        tier: Number(v.tier || 1),
        unit: v.unit || 'unit',
        amounts,
      };
      if (v.emission_factor != null && v.emission_factor !== '') body.emission_factor = norm(v.emission_factor);
      if (v.calorific_value != null && v.calorific_value !== '') body.calorific_value = norm(v.calorific_value);
      s1Payload[key] = body;
    };
    put('solid', s1.solid);
    put('liquid', s1.liquid);
    put('gas', s1.gas);

    const s2Payload = (() => {
      const kwhs = (draftS2?.meters || []).map(r => norm(r.kwh)).filter((n) => typeof n === 'number' && !Number.isNaN(n));
      return kwhs.length ? { electricity: { kwhs } } : {};
    })();

    const areaPayload = (() => {
      if (!draftArea) return null;
      const gross = norm(draftArea.gross);
      const conditioned = norm(draftArea.conditioned);
      if (gross == null && conditioned == null) return null;
      return { gross, conditioned };
    })();

    const out = { year, };
    if (Object.keys(s1Payload).length) out.scope1 = s1Payload;
    if (Object.keys(s2Payload).length) out.scope2 = s2Payload;
    if (areaPayload) out.areas = areaPayload;
    return out;
  }, [draftS1, draftS2, draftArea, year]);

  const handleSubmit = async () => {
    if (!activeBuildingId) return alert('건물을 선택하세요.');
    try {
      await api.post(`/activities/buildings/${activeBuildingId}/submit`, payload);
      alert('저장되었습니다.');
      // 저장 후 최신값 재로드
      const d = await fetchDetail(activeBuildingId, year);
      // 위의 변환 재사용
      const toTierInit = (cat) => {
        if (!cat) return null;
        const [amountOne = ""] = cat.amounts || [];
        const sectionValues = {};
        if (cat.emission_factor != null) sectionValues.ef = cat.emission_factor.toString();
        if (cat.calorific_value != null) sectionValues.ncv = cat.calorific_value.toString();
        return {
          tier: cat.tier,
          unit: cat.unit,
          sectionValues,
          rows: [{ id: 1, fuelType: '', amount: amountOne?.toString?.() ?? '' }],
        };
      };
      setInitialS1({
        solid: toTierInit(d.scope1?.solid) || null,
        liquid: toTierInit(d.scope1?.liquid) || null,
        gas: toTierInit(d.scope1?.gas) || null,
      });
      setInitialS2({
        meters: (d.scope2?.electricity?.kwhs?.length)
          ? d.scope2.electricity.kwhs.map((k, i) => ({ id: i + 1, name: '', kwh: k?.toString?.() ?? '' }))
          : [{ id: 1, name: '', kwh: '' }],
      });
      setInitialArea(d.areas ? {
        gross: d.areas.gross?.toString?.() ?? '',
        conditioned: d.areas.conditioned?.toString?.() ?? '',
      } : null);
    } catch (e) {
      console.error(e);
      alert('저장에 실패했습니다.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.topRow}>
        <div style={styles.leftCol}>
          <h3 style={styles.sectionTitle}>연료 사용량 입력</h3>

          {/* 연도 선택 */}
          <div style={{ display:'flex', gap:8, marginBottom:8 }}>
            <label style={{ fontSize:13, color:'#374151' }}>연도</label>
            <select value={year} onChange={(e)=>setYear(Number(e.target.value))} style={styles.yearSelect}>
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

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
          <Scope1Card
            key={`s1-${activeBuildingId || 'none'}-${year}`}
            initialValue={initialS1}
            onChange={setDraftS1}
          />
        </div>
        <div style={styles.bottomRight}>
          <Scope2Card
            key={`s2-${activeBuildingId || 'none'}-${year}`}
            initialValue={initialS2}
            onChange={setDraftS2}
          />
          <AreaCard
            key={`area-${activeBuildingId || 'none'}-${year}`}
            initialValue={initialArea}
            onChange={setDraftArea}
          />
        </div>
      </div>

      <div style={styles.footer}>
        <button type="button" style={styles.submitBtn} onClick={handleSubmit}>
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
  yearSelect: {
    height: 36, borderRadius: 10, border: '1px solid #e5e7eb', padding: '0 10px', background:'#fff'
  },
  bottomRow: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, alignItems: 'start' },
  bottomLeft: {},
  bottomRight: { display: 'flex', flexDirection: 'column', gap: 16 },
  footer: { display: 'flex', justifyContent: 'center', marginTop: 12 },
  submitBtn: {
    minWidth: 240, height: 44, borderRadius: 10, border: 'none',
    background: '#166534', color: 'white', fontWeight: 600, cursor: 'pointer',
  },
};

export default Input;