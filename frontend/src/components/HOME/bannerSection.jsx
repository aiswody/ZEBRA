import React from 'react';
import leafImg from '../../assets/leaf.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import UserCard from './userCard'; // 로그인 후 카드

const BannerSection = () => {
  const navigate = useNavigate();
  const { user, signIn, isAuthenticated, loading, signOut } = useAuth();

  const [id, setId] = React.useState(() => localStorage.getItem('userId') || '');
  const [password, setPassword] = React.useState('');
  const [saveId, setSaveId] = React.useState(!!localStorage.getItem('userId'));
  const [submitting, setSubmitting] = React.useState(false);

  const handleSignUp = (e) => {
    e.preventDefault();
    if (saveId && id.trim()) localStorage.setItem('userId', id.trim());
    navigate('/signup');
  };

  const handleLogin = async () => {
    if (!id || !password) {
      alert('아이디와 비밀번호를 입력하세요.');
      return;
    }
    try {
      setSubmitting(true);
      const me = await signIn({ username: id, password });
      if (saveId) localStorage.setItem('userId', id.trim());
      else localStorage.removeItem('userId');
      alert(`${me.managerName}님 환영합니다!`);
      navigate('/');
    } catch (e) {
      console.error(e);
      alert('로그인에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.bannerContainer}>
      {/* 왼쪽 배너 */}
      <div style={styles.leafContainer}>
        <img src={leafImg} alt="Leaf" style={styles.leafImage1} />
        <img src={leafImg} alt="Leaf" style={styles.leafImage2} />
        <h1 style={styles.bannerText}>
          Plants make a positive impact<br />on your environment.
        </h1>
        <input
          type="text"
          placeholder="지금 우리 기관의 탄소 배출 현황을 조회하고 감축 방안을 확인해보세요!"
          style={styles.searchBox}
        />
      </div>

      {/* 오른쪽: 로그인 전/후 래퍼를 다르게 */}
      <div style={isAuthenticated ? styles.rightAuth : styles.right}>
        {loading ? null : (
          isAuthenticated ? (
            <UserCard user={user} signOut={signOut} />
          ) : (
            <>
              <div style={styles.loginTabs}>
                <button style={{ ...styles.tabButton, backgroundColor: '#0F4D2A', color: 'white' }}>
                  포털 로그인
                </button>
              </div>

              <input
                placeholder="ID"
                value={id}
                onChange={(e) => setId(e.target.value)}
                style={styles.input}
              />
              <input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />

              <button
                style={{ ...styles.loginButton, opacity: submitting ? 0.6 : 1 }}
                onClick={handleLogin}
                disabled={submitting}
              >
                {submitting ? '처리 중...' : '로그인'}
              </button>

              <div style={styles.loginOptions}>
                <label style={styles.inlineLeft}>
                  <input
                    type="checkbox"
                    checked={saveId}
                    onChange={(e) => setSaveId(e.target.checked)}
                    style={{ marginRight: 6 }}
                  />
                  아이디 저장
                </label>

                <Link to="/signup" onClick={handleSignUp} style={styles.signUpLink}>
                  회원가입
                </Link>
              </div>

              <div style={styles.findRow}>
                <Link to="/find-account" style={styles.findLink}>아이디 / 비밀번호 찾기</Link>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
};

const styles = {
  bannerContainer: {
    marginTop: '100px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '80px 40px 40px 40px',
    backgroundColor: '#f0fdf4',
  },
  leafContainer: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '24px',
  },
  bannerText: {
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: '700',
    fontSize: '50px',
    color: '#1B4332',
    lineHeight: '1.0',
    marginBottom: '70px',
    opacity: 0.9,
    position: 'relative',
    zIndex: 1,
  },
  leafImage1: {
    position: 'absolute',
    top: '100px',
    right: '-50px',
    width: '160px',
    height: 'auto',
    zIndex: 0,
    filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))',
  },
  leafImage2: {
    position: 'absolute',
    top: '140px',
    right: '110px',
    width: '100px',
    height: 'auto',
    zIndex: 0,
    filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))',
    transform: 'scaleX(-1)',
  },
  searchBox: {
    padding: '12px 24px',     // 좌우 여백 +12px
    paddingRight: '140px',     // 오른쪽 끝에 여백 더 확보 (텍스트 뒤 여유)
    borderRadius: '30px',
    border: '1px solid #ccc',
    width: '50%',
    fontSize: '14px',
  },

  // 로그인 전: 카드 스타일(흰 배경/패딩/그림자)
  right: {
    flex: '0 0 300px',
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center',
    position: 'relative',
  },

  // 로그인 후: 바깥은 투명 레이아웃만(이중 카드 방지)
  rightAuth: {
    flex: '0 0 300px',
    background: 'transparent',
    padding: 0,
    borderRadius: 0,
    boxShadow: 'none',
    textAlign: 'center',
    position: 'relative',
  },

  loginTabs: {
    display: 'flex',
    marginBottom: '12px',
    justifyContent: 'flex-start',
  },
  tabButton: {
    width: '30%',
    padding: '5px',
    backgroundColor: '#0F4D2A',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    boxShadow: '2px 4px 10px rgba(0, 0, 0, 0.2)',
    opacity: '0.75',
  },

  input: {
    width: '90%',
    padding: '10px',
    margin: '0 auto 10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
  },

  loginButton: {
    width: '98%',
    padding: '10px',
    backgroundColor: '#0F4D2A',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    margin: '0 auto 12px',
    display: 'block',
  },
  loginOptions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    fontSize: '12px',
    color: '#4b5563',
  },
  inlineLeft: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  signUpLink: {
    textDecoration: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    color: '#0F4D2A',
  },
  findRow: {
    marginTop: '8px',
    fontSize: '12px',
  },
  findLink: {
    textDecoration: 'none',
    color: '#4b5563',
  },
};

export default BannerSection;
