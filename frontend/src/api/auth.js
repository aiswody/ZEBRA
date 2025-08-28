// src/api/auth.js
import { api } from "./client";

// 통일된 토큰 키 (신규) + 레거시 키(현재 인터셉터 호환)
const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const ACCESS_LEGACY_KEY = "access";
const REFRESH_LEGACY_KEY = "refresh";

function persistTokens({ access, refresh }) {
  if (access) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(ACCESS_LEGACY_KEY, access); // 기존 인터셉터 호환
  }
  if (refresh) {
    localStorage.setItem(REFRESH_KEY, refresh);
    localStorage.setItem(REFRESH_LEGACY_KEY, refresh); // 기존 인터셉터 호환
  }
}

// 회원가입 (트레일링 슬래시 필수: APPEND_SLASH=True 환경)
export async function register(payload) {
  const { data } = await api.post("/auth/register/", payload);
  return data;
}

// 로그인
export async function login({ username, password }) {
  const { data } = await api.post("/auth/login/", { username, password });
  persistTokens(data);
  return data;
}

// 내 정보
export async function fetchMe() {
  const { data } = await api.get("/auth/me/"); // 슬래시로 통일
  return data;
}

// 로그아웃
export function logout() {
  [ACCESS_KEY, REFRESH_KEY, ACCESS_LEGACY_KEY, REFRESH_LEGACY_KEY].forEach((k) =>
    localStorage.removeItem(k)
  );
}
