import { api } from "./client";

// 회원가입
export async function register(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

// 로그인
export async function login({ username, password }) {
  const { data } = await api.post("/auth/login/", { username, password });
  // 토큰 localStorage에 저장
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  return data;
}

// 내 정보 가져오기
export async function fetchMe() {
  const { data } = await api.get("/auth/me");
  return data;
}

// 로그아웃
export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}
