// src/components/REGISTER/Input/manage.jsx
import React, { useEffect, useState } from 'react';
import { api } from '../../../api/client';

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
      <h2 style={{ marginBottom: 12 }}>연료 사용량 관리</h2>

      <div style={{ marginBottom: 12, display:'flex', gap:8, alignItems:'center' }}>
        <label style={{ fontSize:13, color:'#374151' }}>연도</label>
        <select value={year} onChange={(e)=>setYear(Number(e.target.value))} style={styles.select}>
          {[thisYear, thisYear - 1, thisYear - 2].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

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
  select: { height: 36, borderRadius: 8, border: '1px solid #e5e7eb', padding: '0 8px', background:'#fff' },
  table: { border: '1px solid #e5e7eb', borderRadius: 12, overflow:'hidden', background:'#fff' },

  // ✅ 헤더/바디 동일 그리드 템플릿
  row: {
    display: 'grid',
    gridTemplateColumns: GRID,
    alignItems: 'center',
    padding: '10px 12px',
    borderBottom: '1px solid #f3f4f6',
    boxSizing: 'border-box',
  },
  head: { background:'#f9fafb', fontWeight:700, color:'#374151' },
  zebra: { background:'#fcfdfc' },

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

  loading: { padding: 12, color:'#6b7280' },
  empty: { padding: 12, color:'#6b7280' },
};

export default ManageActivities;
