//면적 입력 컴포넌트

import React, { useEffect, useMemo, useState } from 'react';

const numberOnly = (v) => {
  if (v === '') return '';
  const cleaned = v.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
  const [intPart, decPart = ''] = parts;
  return decPart.length > 4 ? `${intPart}.${decPart.slice(0, 4)}` : cleaned;
};

const AreaCard = ({ initialValue, onChange }) => {
  const [gross, setGross] = useState('');
  const [conditioned, setConditioned] = useState('');

  // hydrate
  useEffect(() => {
    if (!initialValue) {
      setGross('');
      setConditioned('');
      return;
    }
    setGross(initialValue.gross?.toString?.() ?? '');
    setConditioned(initialValue.conditioned?.toString?.() ?? '');
  }, [initialValue]);

  const ratio = useMemo(() => {
    const g = parseFloat(gross || '0');
    const c = parseFloat(conditioned || '0');
    if (!g || !c) return '';
    const r = (c / g) * 100;
    return isNaN(r) ? '' : r.toFixed(1);
  }, [gross, conditioned]);

  useEffect(() => {
    onChange?.({ gross, conditioned });
  }, [gross, conditioned, onChange]);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.badge}>면적 정보 입력</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div style={styles.col}>
          <label style={styles.smallLabel}>연면적</label>
          <div style={styles.inline}>
            <input
              type="text"
              inputMode="decimal"
              placeholder="m²"
              value={gross}
              onChange={(e) => setGross(numberOnly(e.target.value))}
              style={styles.input}
            />
            <span style={styles.unitNote}>m²</span>
          </div>
        </div>

        <div style={styles.col}>
          <label style={styles.smallLabel}>냉난방 면적</label>
          <div style={styles.inline}>
            <input
              type="text"
              inputMode="decimal"
              placeholder="m²"
              value={conditioned}
              onChange={(e) => setConditioned(numberOnly(e.target.value))}
              style={styles.input}
            />
            <span style={styles.unitNote}>m²</span>
          </div>
        </div>
      </div>

      <div style={styles.helper}>
        냉난방 면적 비율: <strong>{ratio || '-'}</strong> %
      </div>
    </div>
  );
};

const styles = {
  card: { border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', padding: 16 },
  header: { marginBottom: 12 },
  badge: {
    display: 'inline-block',
    border: '1px solid #e5e7eb',
    borderRadius: 999,
    padding: '4px 10px',
    fontSize: 12,
    background: '#fafafa',
  },
  col: { display: 'flex', flexDirection: 'column', gap: 6 },
  smallLabel: { fontSize: 12, color: '#374151' },
  inline: { display: 'flex', alignItems: 'center', gap: 6 },
  unitNote: { fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' },
  input: {
    height: 32,
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    padding: '0 8px',
    width: '100%',
    fontSize: 13,
    boxSizing: 'border-box',
  },
  helper: { fontSize: 12, color: '#6b7280', marginTop: 4 },
};

export default AreaCard;
