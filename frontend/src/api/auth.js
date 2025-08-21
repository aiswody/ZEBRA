import { api } from "./client";

export async function register(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function login({ username, password }) {
  const { data } = await api.post("/auth/login/", { username, password });
  localStorage.setItem("accessToken", data.access);
  localStorage.setItem("refreshToken", data.refresh);
  return data;
}

export async function fetchMe() {
  const { data } = await api.get("/auth/me");
  return data;
}

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  // (선택) 레거시 키 청소
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}