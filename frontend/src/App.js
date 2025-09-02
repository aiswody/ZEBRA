import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import Topbar from './components/ALL/Topbar/topbar.jsx';
import Navbar from './components/ALL/Navbar/navbar.jsx';

import MainPage from './components/HOME/mainPage';
import SignUpPage from './components/SIGNUP/SignUpPage';
import RegisterPage from './components/REGISTER/Building/buildingRegister';
import NoticePage from './components/NOTICE/Notice/notice.jsx';
import EmissionPage from './components/EMISSIONS/emissions.jsx';
// [수정됨] 기존 chatbot.jsx 대신 새로 만든 Chatbot2yo.js를 import 합니다.
import Chatbot2yo from './components/ALL/Chatbot/Chatbot2yo.js';

// 인트로 3단계 페이지
import First from './components/INTRO/Introdution/first.jsx';
import Second from './components/INTRO/Introdution/second.jsx';
import Third from './components/INTRO/Introdution/third.jsx';

// 인증 컨텍스트 & 보호 라우트
import { AuthProvider } from './contexts/authContext';
import PrivateRoute from './routes/privateRoute';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Topbar />
        <Navbar />
        <Routes>
          {/* 공개 페이지 */}
          <Route path="/" element={<MainPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/first" element={<First />} />
          <Route path="/second" element={<Second />} />
          <Route path="/third" element={<Third />} />
          <Route path="/notice" element={<NoticePage />} />
          
          {/* 보호 페이지 (로그인 필요) */}
          <Route
            path="/register"
            element={
              <PrivateRoute>
                <RegisterPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/emissions"
            element={
              <PrivateRoute>
                <EmissionPage />
              </PrivateRoute>
            }
          />
          
          {/* --- [추가됨] --- */}
          {/* 챗봇 페이지도 로그인한 사용자만 접근할 수 있도록 PrivateRoute로 감싸줍니다. */}
          <Route
            path="/chatbot"
            element={
              <PrivateRoute>
                <Chatbot2yo />
              </PrivateRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<div style={{ padding: 40 }}>페이지를 찾을 수 없습니다.</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;



