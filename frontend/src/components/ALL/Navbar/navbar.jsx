import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import zebraLogo from '../../../assets/zebraLogo.png';
import TopRightBar from '../../HOME/rightBar';

const Navbar = () => {
  const location = useLocation(); // ← 현재 경로
  const introRoutes = ['/first', '/second', '/third'];
  const isIntroActive = introRoutes.some(p => location.pathname.startsWith(p));


  const links = [
    { to: '/first',    label: '서비스 소개', isIntroGroup: true },
    { to: '/register',  label: '건물 등록 및 관리' },
    { to: '/emissions', label: '배출량 조회' },
    { to: '/notice',    label: '공지사항' },
  ];

  return (
    <>
      <div style={styles.topBar} />
      <nav style={styles.navbar}>
        <div style={styles.logoContainer}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src={zebraLogo} alt="Zebra Logo" style={styles.logoImage} />
            <div style={styles.logoTextContainer}>
              <div style={styles.logoTitle}>Zebra</div>
              <div style={styles.logoSubtitle}>
                Zero Energy Building Reporting and Advisor
              </div>
            </div>
          </Link>
        </div>

        <ul style={styles.menu}>
          {links.map((it) => (
            <li key={it.to} style={styles.menuItem}>
              <NavLink
                to={it.to}
                style={({ isActive }) => ({
                  ...styles.menuLink,
                  ...(isActive ? styles.menuLinkActive : {}),
                })}
              >
                {it.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <TopRightBar />
      </nav>
    </>
  );
};

const styles = {
  topBar: {
    backgroundColor: '#14532d',
    height: '50px',
    width: '100%',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 99,
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: '16px 32px',
    backgroundColor: '#ffffff',
    position: 'fixed',
    top: '50px', // 초록 바 높이만큼 내림
    left: 0,
    width: '100%',
    zIndex: 100,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  logoContainer: { display: 'flex', alignItems: 'center', marginRight: '200px' },
  logoImage: { height: '48px', marginRight: '12px', filter: 'contrast(1.2) saturate(1.5)' },
  logoTextContainer: { display: 'flex', flexDirection: 'column', lineHeight: '1.2' },
  logoTitle: { fontWeight: 'bold', fontSize: '20px', color: '#111827' },
  logoSubtitle: { fontSize: '14px', color: '#6b7280' },

  menu: {
    display: 'flex',
    flex: 1,
    gap: '80px',
    listStyle: 'none',
    fontWeight: '600',
    fontSize: '16px',
    margin: 0,
    padding: 0,
  },
  menuItem: { display: 'flex', alignItems: 'center' },
  menuLink: {
    textDecoration: 'none',
    color: '#111827',
    padding: '8px 10px',
    borderRadius: 8,
  },
  menuLinkActive: {
    color: '#14532d',
    background: 'rgba(20,83,45,0.08)',
  },

  right: { display: 'flex', gap: '8px', alignItems: 'center' },
  langButton: { background: 'none', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' },
  loginButton: { backgroundColor: '#1B5E20', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' },
};

export default Navbar;
