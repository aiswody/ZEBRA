// frontend/src/components/INPUT/input.jsx
import React, { useEffect, useMemo, useState } from 'react';
import BuildingList from './comp/buildingList';
import InfoBubble from './comp/infoBubble';
import Scope1Card from './comp/scope1Card';
import Scope2Card from './comp/scope2Card';
import AreaCard from './comp/areaCard';
import { api } from '../../../api/client';
import logoFuel from '../../../assets/logo_fuel.png'; // 연료 아이콘

const yearOptions = (() => {
  const now = new Date().getFullYear();
  return [now, now - 1, now - 2];
})();

const Input = () => {
  const [buildings, setBuildings] = useState([]);
  const [activeBuildingId, setActiveBuildingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

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
    return data;
  };

  // 건물/연도 변경 시 서버값 불러와서 카드들의 initialValue로 주입
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!activeBuildingId) return;
      try {
        const d = await fetchDetail(activeBuildingId, year);

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
      const body = { tier: Number(v.tier || 1), unit: v.unit || 'unit', amounts };
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

    const out = { year };
    if (Object.keys(s1Payload).length) out.scope1 = s1Payload;
    if (Object.keys(s2Payload).length) out.scope2 = s2Payload;
    if (areaPayload) out.areas = areaPayload;
    return out;
  }, [draftS1, draftS2, draftArea, year]);

  const handleSubmit = async () => {
    if (!activeBuildingId) return alert('건물을 선택하세요.');
    try {
      await api.post(`/activities/buildings/${activeBuildingId}/submit`, payload);
      alert('저장되었다.');
      window.dispatchEvent(new CustomEvent('dashboard:refresh', { detail: { buildingId: activeBuildingId, year } }));

      // 저장 후 최신값 재로드
      const d = await fetchDetail(activeBuildingId, year);
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
      alert('저장에 실패했다.');
    }
  };

  return (
    <div style={styles.page}>
      {/* ===== 위쪽 카드 ===== */}
      <section style={styles.topCard}>
        {/* 제목 줄 */}
        <div style={styles.titleRow}>
          <img src={logoFuel} alt="연료 아이콘" style={styles.titleIcon} />
          <h3 style={styles.sectionTitle}>연료 사용량 입력</h3>
        </div>

        {/* 좌/우 2컬럼 */}
        <div style={styles.topRow}>
          {/* 왼쪽 */}
          <div style={styles.leftCol}>
            {/* 연도 선택 */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4, marginBottom: 12 }}>
              <label style={styles.yearLabel}>연도 : </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                style={styles.yearSelect}
              >
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

          {/* 오른쪽 */}
          <div style={styles.rightCol}>
            <InfoBubble />
          </div>
        </div>
        {/* 카드 안쪽 divider 제거 */}
      </section>

      {/* 카드 밖(아래)에 구분선 */}
      <div style={styles.dividerOuter} />

      {/* ===== 아래 섹션 ===== */}
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
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    padding: '12px 16px 28px',
  },

  topCard: {
    background: '#fff',
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,.1)",
    padding: '25px 20px 16px',
    marginTop: 20,
    marginBottom: 15,
    marginLeft: -16, // 좌측 맞춤
  },

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 30,
    marginLeft: 4,
    marginTop: -1,
  },
  titleIcon: { width: 28, height: 28, objectFit: 'contain' },
  sectionTitle: { margin: 0, fontSize: 22, lineHeight: '28px', fontWeight: 700, color: '#111827' },

  topRow: { display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16, alignItems: 'start' },
  leftCol: {},
  rightCol: { display: 'flex', justifyContent: 'flex-start' },

  yearLabel: { fontSize: 16, fontWeight: 400, color: '#6B7280', marginTop: 4, marginLeft: 2,},
  yearSelect: { height: 36, borderRadius: 10, border: '1px solid #e5e7eb', padding: '0 10px', background: '#fff' },

  // 카드 밖 구분선 (카드와 동일한 좌측 오프셋/폭 보정)
  dividerOuter: {
    height: 1,
    background: '#e5e7eb',
    margin: '12px 0',
    marginTop : 10,
    width: 'calc(100% + 28px)', // 좌 -14 보정 * 2
    marginLeft: -16,
    width: '99%',
  },

  bottomRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: 16,
    alignItems: 'start',
    marginTop: 25,
    marginLeft: -16, // 위 카드와 좌측 라인 맞춤
  },
  bottomLeft: {},
  bottomRight: { display: 'flex', flexDirection: 'column', gap: 16 },

  footer: { display: 'flex', justifyContent: 'center', marginTop: 20 },

  submitBtn: {
    marginTop: 70,
    height: 50,
    minWidth: 200,
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(180deg, #068729 0%, #068729 100%)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(34,197,94,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}; // ← styles 객체 닫기

export default Input;
