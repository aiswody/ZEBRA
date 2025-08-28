// components/HOME/UserWelcomeCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import ProfileExample from "../../assets/profile_example.png";  // ✅ 새 프로필 이미지로 변경

function formatKST(iso) {
  if (!iso) return '-';
  return new Date(iso)
    .toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    .replace(/\./g, '-')
    .replace(/\s/g, ' ')
    .trim();
}

export default function UserWelcomeCard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <div style={styles.card}>
      {/* 상단 */}
      <div style={styles.headerRow}>
        {/* ✅ 아리아나 → 얼룩말 프로필 이미지 */}
        <img src={ProfileExample} alt="avatar" style={styles.avatar} />

        <div style={{ textAlign: 'left' }}>
          <div style={styles.title}>{user?.managerName} 님, 안녕하세요!</div>
          <div style={styles.role}>{user?.role || '관리자'}</div>
        </div>

        <div style={styles.icons} aria-hidden>
          <span style={styles.iconBox}>⤴︎</span>
          <span style={styles.iconBox}>⚙︎</span>
        </div>
      </div>

      <div style={styles.line} />

      {/* 기관 정보 */}
      <div style={styles.orgRow}>
        <span style={styles.pin} aria-hidden>📍</span>
        <button
          onClick={() => navigate('/register')}
          style={styles.orgLink}
          title="기관 정보/건물 등록으로 이동"
        >
          {user?.institutionName || '-'}
        </button>
        <span style={styles.sep}>|</span>
        <span style={styles.orgType}>{user?.institutionType || '-'}</span>
      </div>

      <div style={styles.lastLogin}>
        최근 로그인 : {formatKST(user?.lastLoginAt)}
      </div>

      {/* 로그아웃 */}
      <button style={styles.logoutBtn} onClick={signOut}>
        로그아웃
      </button>
    </div>
  );
}

const styles = {
  card: {
    width: 300,
    backgroundColor: 'white',
    padding: '24px 24px 16px',
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  headerRow: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
    textAlign: 'left',
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: '#e5e7eb',
    flex: '0 0 auto',
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: '#111827',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  role: {
    marginTop: 2,
    fontSize: 12,
    color: '#6b7280',
  },
  icons: { marginLeft: 'auto', display: 'flex', gap: 8 },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: '1px solid #e5e7eb',
    display: 'grid',
    placeItems: 'center',
    color: '#9ca3af',
    fontSize: 12,
  },
  line: { height: 1, background: '#f3f4f6', margin: '12px 0' },
  orgRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  pin: { color: '#0F4D2A' },
  orgLink: {
    all: 'unset',
    cursor: 'pointer',
    color: '#0F4D2A',
    fontWeight: 700,
    fontSize: 16,
    borderBottom: '1px solid transparent',
  },
  sep: { color: '#94a3b8', margin: '0 2px', fontSize: 12 },
  orgType: { color: '#4b5563', fontSize: 12 },
  lastLogin: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'left',
  },
  logoutBtn: {
    marginTop: 20,
    width: '100%',
    padding: '12px 0',
    background: '#185c37',
    color: '#fff',
    border: 0,
    borderRadius: 9,
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
  },
};
