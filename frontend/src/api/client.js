// client.js
import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE ?? "/api";
export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // ← 한 키만 사용
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // (선택) 공통 Accept 헤더
  if (!config.headers.Accept) config.headers.Accept = "application/json";
  return config;
});