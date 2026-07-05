import axios from "axios";
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from "./tokenStorage";

const baseURL = process.env.REACT_APP_API_BASE ?? "/api";
export const api = axios.create({ baseURL });

// --- 요청 인터셉터 ---
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (!config.headers.Accept) config.headers.Accept = "application/json";
  return config;
});

// 동시에 여러 요청이 401을 받아도 refresh 호출은 한 번만 하도록 공유
let refreshPromise = null;

function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.reject(new Error("No refresh token"));

  if (!refreshPromise) {
    // interceptor 재귀 방지를 위해 api 인스턴스가 아닌 별도 axios 호출 사용
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh/`, { refresh: refreshToken })
      .then(({ data }) => {
        setAccessToken(data.access);
        if (data.refresh) setRefreshToken(data.refresh);
        return data.access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// --- 응답 인터셉터: 401 발생 시 refresh 토큰으로 access 토큰 갱신 후 원요청 재시도 ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isAuthEndpoint = config?.url?.includes("/auth/login") || config?.url?.includes("/auth/refresh");

    if (response?.status === 401 && config && !config._retried && !isAuthEndpoint) {
      config._retried = true;
      try {
        const newAccessToken = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(config);
      } catch {
        clearTokens();
      }
    }

    return Promise.reject(error);
  }
);

// --- API 함수들 ---
export const fetchUserBuildings = () => {
  return api.get('/chatbot/buildings/');
};

export const getAIRecommendation = (buildingData) => {
  return api.post('/chatbot/analyze/', { buildings: buildingData });
};

// 보고서 다운로드 (DOCX)
export const downloadReport = (year) => {
  return api.get('/reports/download', {
    params: { year },
    responseType: 'blob',
  });
};

// [추가] 파일명 만들려고 기관명/연도 가져오기
export const fetchReportContext = (year) => {
  return api.get('/reports/context', {
    params: { year },
  });
};
