import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, fetchMe } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);      // me 응답(예: {managerName, ...})
  const [loading, setLoading] = useState(true); // 초기 토큰 검사 로딩
  const isAuthenticated = !!user;

  // 앱 최초 로드 시 토큰 있으면 /me 조회해 로그인 상태 복구
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) { setLoading(false); return; }
    (async () => {
      try {
        const me = await fetchMe();
        setUser(me);
      } catch {
        // 토큰 만료/무효
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async ({ username, password }) => {
    // apiLogin 내부에서 access/refresh를 localStorage에 저장한다고 가정
    await apiLogin({ username, password });
    const me = await fetchMe();
    setUser(me);
    return me;
  };

  const signOut = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
