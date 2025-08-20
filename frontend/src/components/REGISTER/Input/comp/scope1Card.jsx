// Scope1 입력 컴포넌트

import React from 'react';
import TierSection from './tierSection';

const Scope1Card = ({ initialValue }) => {
  return (
    <div style={styles.wrapper}>
      <div style={styles.headerRow}>
        <span style={styles.badge}>Scope 1</span>
      </div>

      <div style={styles.grid}>
        {/* 고체 연료 */}
        <TierSection
          title="고체 연료"
          unitLabel="단위"
          fuelOptions={['무연탄', '유연탄']}
          initialValue={initialValue?.solid}
          getFieldsForTier={(tier) => {
            if (tier === 2) {
              return [{ key: 'ef', label: '배출계수', unit: 'kgGHG/TJ', placeholder: '예: 98500' }];
            }
            if (tier === 3) {
              return [
                { key: 'ef', label: '배출계수', unit: 'kgGHG/TJ', placeholder: '예: 98500' },
                { key: 'ncv', label: '열량계수', unit: 'MJ/kg', placeholder: '예: 25.5' },
              ];
            }
            return [];
          }}
        />

        {/* 액체 연료 */}
        <TierSection
          title="액체 연료"
          unitLabel="단위"
          fuelOptions={['원유', '등유']}
          initialValue={initialValue?.liquid}
          getFieldsForTier={(tier) => {
            if (tier === 3) {
              return [{ key: 'ncv', label: '열량계수', unit: 'MJ/L', placeholder: '예: 35.0' }];
            }
            return [];
          }}
        />

        {/* 기체 연료 */}
        <TierSection
          title="기체 연료"
          unitLabel="단위"
          fuelOptions={['천연가스', '도시가스']}
          initialValue={initialValue?.gas}
          getFieldsForTier={(tier) => {
            if (tier === 3) {
              return [{ key: 'ncv', label: '열량계수', unit: 'MJ/m³', placeholder: '예: 38.0' }];
            }
            return [];
          }}
        />
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    background: '#fff',
    padding: 16,
  },
  headerRow: { marginBottom: 12 },
  badge: {
    display: 'inline-block',
    border: '1px solid #e5e7eb',
    borderRadius: 999,
    padding: '4px 10px',
    fontSize: 12,
    background: '#fafafa',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
};

export default Scope1Card;