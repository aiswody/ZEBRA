// client.js
import axios from "axios";

// CRA는 REACT_APP_* 만 인식합니다.
// 프론트:3000 / 백:8000로 분리 배포면 "http://10.74.15.176:8000/api" 처럼 절대경로로 넣어도 됩니다.
const baseURL = process.env.REACT_APP_API_BASE ?? "/api";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  // 두 키 모두 대응 (auth.js/다른 코드와 호환)
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// (선택) 401 대응 공통 처리
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err?.response?.status === 401) {
//       localStorage.removeItem("accessToken");
//       localStorage.removeItem("access");
//       localStorage.removeItem("refresh");
//       // 필요하면 로그인 페이지로 이동 처리
//     }
//     return Promise.reject(err);
//   }
// );
