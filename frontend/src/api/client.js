import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE ?? "/api";
export const api = axios.create({ baseURL });

// --- 요청 인터셉터 (수정 없음) ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (!config.headers.Accept) config.headers.Accept = "application/json";
  return config;
});

// --- [추가/수정됨] 응답 인터셉터 (글로벌 에러 처리) ---
api.interceptors.response.use(
  // 정상 응답은 그대로 반환
  (response) => response,
  // 에러가 발생했을 때
  (error) => {
    // 💥 이전 코드에서는 아마 이 부분에 window.location.href = '/' 같은 코드가 있었을 겁니다.
    // 그 코드를 삭제하고, 아래와 같이 에러를 그대로 반환하도록 수정합니다.
    // 이렇게 해야 PrivateRoute와 authContext가 정상적으로 동작합니다.
    return Promise.reject(error);
  }
);


// --- API 함수들 (수정 없음) ---
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



