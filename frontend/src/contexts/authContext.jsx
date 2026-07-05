import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, fetchMe, logout as apiLogout } from '../api/auth';
import { getAccessToken } from '../api/tokenStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);      // me 응답(예: {managerName, ...})
  const [loading, setLoading] = useState(true); // 초기 토큰 검사 로딩
  const isAuthenticated = !!user;

  // 앱 최초 로드 시 토큰 있으면 /me 조회해 로그인 상태 복구
  // (access 토큰이 만료됐어도 client.js의 응답 인터셉터가 refresh 토큰으로 자동 갱신을 시도한다)
  useEffect(() => {
    const token = getAccessToken();
    if (!token) { setLoading(false); return; }
    (async () => {
      try {
        const me = await fetchMe();
        setUser(me);
      } catch {
        // 토큰 만료/무효 (refresh도 실패한 경우)
        apiLogout();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async ({ username, password }) => {
    // apiLogin 내부에서 accessToken/refreshToken을 localStorage에 저장한다
    await apiLogin({ username, password });
    const me = await fetchMe();
    setUser(me);
    return me;
  };

  const signOut = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
