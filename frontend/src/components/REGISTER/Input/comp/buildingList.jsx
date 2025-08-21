// 건물 목록 컴포넌트

import React from 'react';

const usageCodeToLabel = {
  OFFICE: '업무 시설',
  EDU_RESEARCH: '교육 연구 시설',
  CULTURE_ASSEMBLY: '문화 및 집회시설',
  MEDICAL: '의료 시설',
  TRAINING: '수련 시설',
  TRANSPORT: '운수 시설',
};

const BuildingList = ({ buildings, activeId, onSelect, loading }) => {
  return (
    <div style={styles.wrapper}>
      <div style={styles.list} aria-label="등록 건물 목록">
        {loading ? (
          <div style={styles.skeleton}>불러오는 중…</div>
        ) : buildings?.length ? (
          buildings.map((b) => {
            const usageLabel = b.usageLabel || usageCodeToLabel[b.usage] || '';
            const metaParts = [];
            if (usageLabel) metaParts.push(`용도: ${usageLabel}`);
            if (b.address) metaParts.push(`주소: ${b.address}`);
            const meta = metaParts.join(' · ');

            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelect(b.id)}
                style={{
                  ...styles.item,
                  ...(activeId === b.id ? styles.itemActive : {}),
                }}
                title={meta ? `${b.name}\n${meta}` : b.name}
                aria-pressed={activeId === b.id}
              >
                <div style={styles.itemName}>{b.name}</div>
                {meta && <div style={styles.itemMeta}>{meta}</div>}
              </button>
            );
          })
        ) : (
          <div style={styles.empty}>등록된 건물이 없습니다.</div>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: { background: 'white' },
  list: {
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 8,
    height: 240, // 고정 높이
    overflowY: 'auto',
    background: '#fff',
  },
  item: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    background: '#fff',
    cursor: 'pointer',
    marginBottom: 8,
  },
  itemActive: {
    outline: '2px solid #16a34a',
    background: '#f0fdf4',
  },
  itemName: {
    fontWeight: 700,
    fontSize: 14,
    lineHeight: '18px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemMeta: {
    marginTop: 4,
    fontSize: 12,
    color: '#6b7280',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  skeleton: { padding: 12, color: '#6b7280', fontSize: 14 },
  empty: { padding: 12, color: '#6b7280', fontSize: 14 },
};

export default BuildingList;
