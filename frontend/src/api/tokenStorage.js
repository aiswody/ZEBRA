// frontend/src/api/tokenStorage.js
export function getAccessToken() {
    return localStorage.getItem('accessToken');
  }
  export function setAccessToken(token) {
    localStorage.setItem('accessToken', token);
  }
  export function getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }
  export function setRefreshToken(token) {
    localStorage.setItem('refreshToken', token);
  }
  export function clearTokens() {
    ['accessToken', 'refreshToken', 'access', 'refresh'].forEach(k => localStorage.removeItem(k));
  }
  
  // (선택) 레거시 키에서 1회 마이그레이션
  export function migrateLegacyOnce() {
    if (!localStorage.getItem('accessToken') && localStorage.getItem('access')) {
      localStorage.setItem('accessToken', localStorage.getItem('access'));
    }
    if (!localStorage.getItem('refreshToken') && localStorage.getItem('refresh')) {
      localStorage.setItem('refreshToken', localStorage.getItem('refresh'));
    }
  }
  