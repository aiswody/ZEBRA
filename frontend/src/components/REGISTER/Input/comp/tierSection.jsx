import React, { useEffect, useMemo, useState } from 'react';

const numberOnly = (v) => {
  if (v === '') return '';
  const cleaned = v.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
  const [intPart, decPart = ''] = parts;
  return decPart.length > 4 ? `${intPart}.${decPart.slice(0, 4)}` : cleaned;
};

const TierSection = ({
  title,
  unit = 'unit',
  fuelOptions = [],
  getFieldsForTier, // (tier) => [{ key, label, unit, placeholder }]
  initialValue,     // { tier, unit, sectionValues, rows }
  onChange,
}) => {
  const [tier, setTier] = useState(1);
  const fields = useMemo(() => getFieldsForTier?.(tier) ?? [], [tier, getFieldsForTier]);
  const [sectionValues, setSectionValues] = useState({});
  const [rows, setRows] = useState([{ id: 1, fuelType: '', amount: '' }]);

  // hydrate
  useEffect(() => {
    if (!initialValue) {
      setTier(1);
      setSectionValues({});
      setRows([{ id: 1, fuelType: '', amount: '' }]);
      return;
    }
    setTier(initialValue.tier && [1,2,3].includes(initialValue.tier) ? initialValue.tier : 1);
    setSectionValues(initialValue.sectionValues || {});
    const initRows = Array.isArray(initialValue.rows) && initialValue.rows.length
      ? initialValue.rows.map((r, idx) => ({
          id: r.id ?? Date.now() + idx,
          fuelType: r.fuelType ?? '',
          amount: r.amount?.toString?.() ?? '',
        }))
      : [{ id: 1, fuelType: '', amount: '' }];
    setRows(initRows);
  }, [initialValue]);

  const addRow = () => setRows((prev) => [...prev, { id: Date.now(), fuelType: '', amount: '' }]);
  const removeRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id));
  const updateRow = (id, patch) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const onChangeSectionVal = (k, v) =>
    setSectionValues((s) => ({ ...s, [k]: numberOnly(v) }));

  // 상위로 알림
  useEffect(() => {
    onChange?.({ tier, unit, sectionValues, rows });
  }, [tier, unit, sectionValues, rows, onChange]);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.title}>{title}</div>
        <div style={styles.tierWrap}>
          <label htmlFor={`${title}-tier`} style={styles.tierLabel}>Tier</label>
          <select
            id={`${title}-tier`}
            value={tier}
            onChange={(e) => setTier(Number(e.target.value))}
            style={styles.select}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </div>
      </div>

      {/* 티어별 섹션 공통 입력칸 */}
      {fields.length > 0 && (
        <div style={styles.inlineInputs}>
          {fields.map((f) => (
            <div key={f.key} style={styles.inlineInputItem}>
              <label style={styles.inlineLabel}>{f.label}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder={f.placeholder}
                  value={sectionValues[f.key] ?? ''}
                  onChange={(e) => onChangeSectionVal(f.key, e.target.value)}
                  style={{ ...styles.input, flex: 1 }}
                />
                <span style={{ whiteSpace: 'nowrap', fontSize: 12, color: '#6b7280', flexShrink: 0 }}>
                  {f.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 연료행 테이블 */}
      <div style={styles.table}>
        <div style={styles.tableHead}>
          <div style={{ marginLeft: 20, flex: 6 }}>종류</div>
          <div style={{ flex: 1, marginLeft: 10, whiteSpace: 'nowrap', }}>사용량</div>
          <div style={{ flex: 1, whiteSpace: 'nowrap', marginLeft: 10, }}>단위</div>
          <div style={{ width: 40 }} />
        </div>
        {rows.map((row) => (
          <div key={row.id} style={styles.tableRow}>
            <div style={{ flex: 3 }}>
              <select
                value={row.fuelType}
                onChange={(e) => updateRow(row.id, { fuelType: e.target.value })}
                style={styles.select}
              >
                <option value="">연료 선택</option>
                {fuelOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 2 }}>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.0"
                value={row.amount}
                onChange={(e) => updateRow(row.id, { amount: numberOnly(e.target.value) })}
                style={styles.input}
              />
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', color: '#6b7280', whiteSpace: 'nowrap', fontSize: 13 }}>
              {unit}
            </div>

            <div style={{ width: 40, display: 'flex', justifyContent: 'center' }}>
              <button type="button" onClick={() => removeRow(row.id)} style={styles.iconBtn} title="행 삭제">
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.addRowWrap}>
        <button type="button" onClick={addRow} style={styles.addBtn}>＋</button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 16,
    background: '#fff',
  },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontWeight: 700, fontSize: 16 },
  tierWrap: { display: 'flex', alignItems: 'center', gap: 6 },
  tierLabel: { fontSize: 12, color: '#6b7280' },
  select: {
    width: '100%',
    minWidth: 80,
    height: 36,
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    background: '#fff',
    padding: '0 10px',
    whiteSpace: 'nowrap',
  },
  inlineInputs: { display: 'grid', gridTemplateColumns: '1fr', gap: 6, marginBottom: 10 },
  inlineInputItem: { display: 'flex', flexDirection: 'column', gap: 6 },
  inlineLabel: { fontSize: 12, color: '#374151' },
  input: {
    height: 32,
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    padding: '0 8px',
    width: '100%',
    fontSize: 13,
    flex: 1,
    boxSizing: 'border-box',
  },
  table: { display: 'flex', flexDirection: 'column', gap: 8 },
  tableHead: {
    display: 'flex', gap: 10, fontSize: 12, color: '#6b7280', padding: '0 6px',
  },
  tableRow: { display: 'flex', gap: 6, alignItems: 'center',},
  addRowWrap: { display: 'flex', justifyContent: 'flex-end', marginTop: 10 },
  addBtn: {
    width: 32, height: 32, borderRadius: 18, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 22,
  },
  iconBtn: {
    width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer',
  },
};

export default TierSection;
