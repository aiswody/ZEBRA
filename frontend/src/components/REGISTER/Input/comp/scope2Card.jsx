//scope2 입력 컴포넌트

import React, { useEffect, useMemo, useState } from 'react';

const numberOnly = (v) => {
  if (v === '') return '';
  const cleaned = v.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
  const [intPart, decPart = ''] = parts;
  return decPart.length > 4 ? `${intPart}.${decPart.slice(0, 4)}` : cleaned;
};

const Scope2Card = ({
  initialValue,
  title = '전기',
  rowUnit = 'kWh',
  onChange,
}) => {
  const [rows, setRows] = useState([{ id: 1, name: '', kwh: '' }]);

  useEffect(() => {
    if (!initialValue?.meters?.length) {
      setRows([{ id: 1, name: '', kwh: '' }]);
      return;
    }
    const mapped = initialValue.meters.map((m, idx) => ({
      id: m.id ?? Date.now() + idx,
      name: m.name ?? '',
      kwh: m.kwh?.toString?.() ?? '',
    }));
    setRows(mapped);
  }, [initialValue]);

  const addRow = () => setRows((prev) => [...prev, { id: Date.now(), name: '', kwh: '' }]);
  const removeRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id));
  const updateRow = (id, patch) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const totalKwh = useMemo(
    () => rows.reduce((sum, r) => sum + (parseFloat(r.kwh || '0') || 0), 0),
    [rows]
  );

  useEffect(() => {
    onChange?.({ meters: rows });
  }, [rows, onChange]);

  return (
    <div style={styles.card}>
      {/* Scope 2 배지 */}
      <div style={styles.headerRow}>
        <span style={styles.badge}>Scope 2</span>
      </div>

      {/* 상단 제목: 전기 */}
      <div style={styles.subHeader}>
        <strong style={styles.headerTitle}>{title}</strong>
      </div>

      {/* 입력부 */}
      <div style={styles.table}>
        {rows.map((row) => (
          <div key={row.id} style={styles.tableRow}>
            <div style={styles.inputCol}>
              {/* 라벨 행 */}
              <div style={styles.labelRow}>
                <label style={styles.label}>사용량</label>
                <span style={styles.label}>단위</span>
              </div>

              {/* 입력 + 단위 행 */}
              <div style={styles.inputRow}>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={row.kwh}
                  onChange={(e) => updateRow(row.id, { kwh: numberOnly(e.target.value) })}
                  style={styles.input}
                />
                <span style={styles.unitText}>{rowUnit}</span>
              </div>
            </div>

            {/* 삭제 버튼 */}
            <div style={{ width: 40, display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                style={styles.iconBtn}
                title="행 삭제"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 합계 + 추가 버튼 */}
      <div style={styles.footerRow}>
        <div style={styles.totalBox}>
          합계 <strong>{isNaN(totalKwh) ? 0 : totalKwh}</strong> {rowUnit}
        </div>
        <button type="button" onClick={addRow} style={styles.addBtn}>＋</button>
      </div>
    </div>
  );
};

const styles = {
  card: { border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', padding: 16 },
  headerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },

  badge: {
    display: 'inline-block',
    border: '1px solid #e5e7eb',
    borderRadius: 999,
    padding: '4px 10px',
    fontSize: 12,
    background: '#fafafa',
  },

  subHeader: {
    display: 'flex',
    alignItems: 'baseline',
    marginTop: 10,
    marginBottom: 12,
  },
  headerTitle: { fontSize: 16, color: '#111827' },

  table: { display: 'flex', flexDirection: 'column', gap: 12 },
  tableRow: { display: 'flex', gap: 8, alignItems: 'flex-start' },

  inputCol: { flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },

  labelRow: { display: 'flex', justifyContent: 'space-between' },
  label: { fontSize: 13, color: '#6b7280' },

  inputRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  input: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    padding: '0 12px',
    fontSize: 13,
    boxSizing: 'border-box',
  },
  unitText: { fontSize: 13, color: '#6b7280', minWidth: 40, textAlign: 'right' },

  iconBtn: {
    width: 36, height: 36, borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer',
  },

  footerRow: { marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  totalBox: {
    fontSize: 13, color: '#111827', background: '#f9fafb',
    border: '1px solid #e5e7eb', borderRadius: 10, padding: '6px 10px',
  },
  addBtn: {
    width: 44, height: 44, borderRadius: 999, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 22,
  },
};

export default Scope2Card;