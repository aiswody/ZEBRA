// src/components/REGISTER/Input/manage.jsx
import React, { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import logoFuel from '../../../assets/logo_fuel.png'; // 상단 카드 아이콘

// 숫자 표시: 항상 소수점 2자리, 없으면 '-'
function fmt2(v) {
  if (v === null || v === undefined) return '-';
  const n = typeof v === 'string' ? Number(v) : v;
  if (!Number.isFinite(n)) return '-';
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

// ✅ 헤더/바디 공통으로 쓰는 고정 그리드 (이 순서/폭 그대로)
const GRID = '2fr 110px 110px 110px 140px 140px 140px';
const HEADERS = ['건물명', '고체', '액체', '기체', '전기(kWh)', '연면적(m²)', '냉난방(m²)'];

const ManageActivities = () => {
  const thisYear = new Date().getFullYear();
  const [rows, setRows] = useState([]);
  const [year, setYear] = useState(thisYear);
  const [loading, setLoading] = useState(true);

  const load = async (y) => {
    const { data } = await api.get('/activities/summary', { params: { year: y } });
    return Array.isArray(data) ? data : [];
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const list = await load(year);
        if (!mounted) return;
        setRows(list);
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [year]);

  return (
    <div style={{ padding: 20 }}>
      {/* 상단 제목 카드 (Tier 페이지 수치 매칭) */}
      <section style={styles.topCard}>
        <div style={styles.topLeft}>
          <div style={styles.titleRow}>
            <img src={logoFuel} alt="Fuel Logo" style={styles.topIcon} />
            <h1 style={styles.topTitle}>연료 사용량 관리</h1>
          </div>
          <p style={styles.topDesc}>
            기관/건물의 연료·전기 사용 및 면적 지표를 연도별로 조회합니다.
          </p>
        </div>

        <div style={styles.topActions}>
          <label style={styles.yearLabel}>연도</label>
          <select
            value={year}
            onChange={(e)=>setYear(Number(e.target.value))}
            style={styles.select}
          >
            {[thisYear, thisYear - 1, thisYear - 2].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </section>

      {/* 데이터 테이블 */}
      <div style={styles.table}>
        {/* 헤더 */}
        <div style={{ ...styles.row, ...styles.head }}>
          {HEADERS.map((h, i) => (
            <div
              key={h}
              style={{
                ...styles.cell,
                ...(i === 0 ? styles.nameCell : styles.numCellHead),
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* 바디 */}
        {loading ? (
          <div style={styles.loading}>불러오는 중…</div>
        ) : rows.length ? (
          rows.map((r, idx) => (
            <div
              key={`${r.buildingId ?? r.id}-${r.year}`}
              style={{ ...styles.row, ...(idx % 2 ? styles.zebra : null) }}
            >
              <div style={{ ...styles.cell, ...styles.nameCell }} title={r.buildingName ?? r.name}>
                {r.buildingName ?? r.name}
              </div>
              <div style={{ ...styles.cell, ...styles.numCell }}>{fmt2(r.solid_amount)}</div>
              <div style={{ ...styles.cell, ...styles.numCell }}>{fmt2(r.liquid_amount)}</div>
              <div style={{ ...styles.cell, ...styles.numCell }}>{fmt2(r.gas_amount)}</div>
              <div style={{ ...styles.cell, ...styles.numCell }}>{fmt2(r.total_kwh)}</div>
              <div style={{ ...styles.cell, ...styles.numCell }}>{fmt2(r.gross_area)}</div>
              <div style={{ ...styles.cell, ...styles.numCell }}>{fmt2(r.conditioned_area)}</div>
            </div>
          ))
        ) : (
          <div style={styles.empty}>저장된 데이터가 없습니다.</div>
        )}
      </div>
    </div>
  );
};

const styles = {
  /* 상단 카드 영역 — Tier와 동일 수치 */
  topCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 24px 16px',        // 내부 위쪽 패딩 24px
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,.1)',
    width: '100%',                      // 폭 96%
    margin: '12px 0 24px 0px',         // 위 30px / 좌 0px (왼쪽 마진 맞춤)
    marginLeft: -20,
    boxSizing: 'border-box',
  },
  topLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',          // Tier와 동일 정렬
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,                           // 아이콘 ↔ 제목 간격
    marginBottom: 30,                  // 제목 묶음 ↔ 설명 간 간격 (Tier와 동일)
  },
  topIcon: { width: 28, height: 28, objectFit: 'contain', display: 'block' },
  topTitle: {
    margin: 0,
    fontSize: 22,
    lineHeight: '28px',
    color: '#111827',
    fontWeight: 'bold',                // Tier의 굵기 값 매칭
  },
  topDesc: {
    margin: 0,
    marginBottom: 15,                  // 설명문 하단 여백
    fontSize: 16,                      // Tier와 동일
    color: '#6B7280',
    fontWeight: 400,
    lineHeight: '24px',                // 줄 간격 매칭
  },

  topActions: { display: 'flex', alignItems: 'center', gap: 8 },
  yearLabel: { fontSize: 13, color: '#374151' },

  select: {
    height: 36,
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    padding: '0 8px',
    background: '#fff',
  },

  /* 테이블 */
  table: { border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', background: '#fff',  marginLeft: -20, marginTop : 50, width: '100%', },

  // ✅ 헤더/바디 동일 그리드 템플릿
  row: {
    display: 'grid',
    gridTemplateColumns: GRID,
    alignItems: 'center',
    padding: '10px 12px',
    borderBottom: '1px solid #f3f4f6',
    boxSizing: 'border-box',
  },
  head: { background: '#f9fafb', fontWeight: 700, color: '#374151' },
  zebra: { background: '#fcfdfc' },

  cell: {
    minWidth: 0,
    boxSizing: 'border-box',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  nameCell: { textAlign: 'left' },
  numCell: {
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums', // 숫자 자리 예쁘게 정렬
  },
  numCellHead: { textAlign: 'right' },

  loading: { padding: 12, color: '#6b7280' },
  empty: { padding: 12, color: '#6b7280' },
};

export default ManageActivities;
