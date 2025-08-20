// src/components/COMMON/Profile/ProfileSimple.jsx
import React from 'react';
import { useAuth } from '../../../contexts/authContext';

export default function ProfileSimple() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading || !isAuthenticated) return null;

  return (
    <div style={styles.wrap}>
      <div style={styles.title}>Profile</div>

      {/* ✅ 2열 그리드: 1열=아이콘/불릿(고정폭), 2열=텍스트 */}
      <div style={styles.info}>
        <span style={styles.icon} aria-hidden>🏢</span>
        <span style={styles.primary} title={user?.institutionName}>
          {user?.institutionName || '-'}
        </span>

        <span style={styles.bullet} aria-hidden>-</span>
        <span style={styles.secondary}>{user?.institutionType || '-'}</span>

        <span style={styles.bullet} aria-hidden>-</span>
        <span style={styles.secondary}>담당자 : {user?.managerName || '-'}</span>
      </div>

      <div style={styles.divider} />
    </div>
  );
}

const ellipsis = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };

const styles = {
  wrap: {
    padding: '20px 16px 12px',
    borderBottom: '1px solid #e5e7eb',
    textAlign: 'left',                // 부모가 center여도 이 컴포넌트는 좌측 정렬
  },
  title: { fontSize: 16, fontWeight: 900, color: '#1f2937', marginBottom: 14, lineHeight: 1.2 },

  // ✅ 정렬 핵심
  info: {
    display: 'grid',
    gridTemplateColumns: '24px 1fr',  // 1열 고정폭, 2열 가변
    columnGap: 8,
    rowGap: 8,
    alignItems: 'left',
  },
  icon: { fontSize: 18, lineHeight: 1, textAlign: 'left' },
  bullet: { textAlign: 'center' },    // 불릿 위치 고정
  primary: { fontSize: 18, fontWeight: 800, color: '#374151', ...ellipsis },
  secondary: { fontSize: 16, color: '#6b7280', ...ellipsis },

  divider: { height: 1, background: '#eef2f7', marginTop: 12 },
};
