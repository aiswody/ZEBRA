// 티어 말풍선 컴포넌트

import React from 'react';

const InfoBubble = () => {
  return (
    <div style={styles.bubble} role="note">
      <div style={styles.row}>
        <span style={styles.leadEmoji}>💡</span>
        <div>아직 Tier를 선택하지 않으셨다면, 좌측 메뉴의 <strong>"Tier 설명"</strong>을 통해 연료별 권장 Tier를 확인해 주세요.</div>
      </div>
      <div style={styles.row}>
        <span style={styles.pinEmoji}>📌</span>
        <div>
          Tier 2 이상(2, 3) 선택 시, ‘IPCC 가이드라인’, ‘환경부 지침’, 및 ‘ISO 14064-1’ 기준에 따라<br />
          사용자가 직접 측정하거나 자체 산정한 <strong>발열량</strong>, <strong>산화율</strong>, <strong>열량 등의 계수</strong>를 입력해야 합니다.
        </div>
      </div>
    </div>
  );
};

const styles = {
  bubble: {
    marginTop: '55px',
    marginLeft: 10,
    maxWidth: 900,
    width: '100%',
    borderRadius: 12,
    border: '1px solid #d1fae5',
    background: '#ecfdf5',
    padding: 16,
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    lineHeight: 1.45,
  },
  row: { display: 'flex', gap: 8, marginBottom: 8 },
  leadEmoji: { fontSize: 18, lineHeight: '22px' },
  pinEmoji: { fontSize: 18, lineHeight: '22px' },
};

export default InfoBubble;
