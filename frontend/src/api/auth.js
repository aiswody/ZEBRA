// src/api/auth.js
import { api } from "./client";
import { setAccessToken, setRefreshToken, clearTokens } from "./tokenStorage";

function persistTokens({ access, refresh }) {
  if (access) setAccessToken(access);
  if (refresh) setRefreshToken(refresh);
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
  clearTokens();
}
