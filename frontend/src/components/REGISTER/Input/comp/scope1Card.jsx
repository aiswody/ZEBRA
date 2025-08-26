// Scope1 입력 컴포넌트 (state 상위로 올림)

import React, { useEffect, useState } from 'react';
import TierSection from './tierSection';

const Scope1Card = ({ initialValue, onChange }) => {
  // 각 카테고리별 내부 상태를 TierSection이 관리하고, 여기서 합쳐 상위로 전달
  const [solid, setSolid] = useState(null);
  const [liquid, setLiquid] = useState(null);
  const [gas, setGas] = useState(null);

  useEffect(() => {
    // initialValue: { solid, liquid, gas } 형태
    setSolid(initialValue?.solid || null);
    setLiquid(initialValue?.liquid || null);
    setGas(initialValue?.gas || null);
  }, [initialValue]);

  // 상위로 payload 친화적인 형태 전달
  useEffect(() => {
    const toPayload = (v) => {
      if (!v) return null;
      const amounts = (v.rows || []).map(r => r.amount).filter((x) => x !== '' && x != null);
      return {
        tier: v.tier || 1,
        unit: v.unit || 'unit',
        amounts,
        emission_factor: v.sectionValues?.ef ?? null,
        calorific_value: v.sectionValues?.ncv ?? null,
      };
    };
    onChange?.({
      solid: toPayload(solid),
      liquid: toPayload(liquid),
      gas: toPayload(gas),
    });
  }, [solid, liquid, gas, onChange]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.headerRow}>
        <span style={styles.badge}>Scope 1</span>
      </div>

      <div style={styles.grid}>
        {/* 고체 연료 (단위: ton) */}
        <TierSection
          title="고체 연료"
          unit="ton"
          fuelOptions={['무연탄', '유연탄']}
          initialValue={initialValue?.solid}
          onChange={setSolid}
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

        {/* 액체 연료 (단위: L) */}
        <TierSection
          title="액체 연료"
          unit="L"
          fuelOptions={['원유', '등유']}
          initialValue={initialValue?.liquid}
          onChange={setLiquid}
          getFieldsForTier={(tier) => {
            if (tier === 3) {
              return [{ key: 'ncv', label: '열량계수', unit: 'MJ/L', placeholder: '예: 35.0' }];
            }
            return [];
          }}
        />

        {/* 기체 연료 (단위: m³) */}
        <TierSection
          title="기체 연료"
          unit="m³"
          fuelOptions={['천연가스', '도시가스']}
          initialValue={initialValue?.gas}
          onChange={setGas}
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