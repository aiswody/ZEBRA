// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Topbar from './components/ALL/Topbar/topbar.jsx';
import Navbar from './components/ALL/Navbar/navbar.jsx';

import MainPage from './components/HOME/mainPage';
import SignUpPage from './components/SIGNUP/SignUpPage';
import RegisterPage from './components/REGISTER/Building/buildingRegister';
import NoticePage from './components/NOTICE/Notice/notice.jsx';
import IntroPage from './components/INTRO/Introdution/intro.jsx';
import EmissionPage from './components/EMISSIONS/emissions.jsx';

// ✅ 추가: 인증 컨텍스트 & 보호 라우트
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
          <Route path="/intro" element={<IntroPage />} />
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

          {/* 404 */}
          <Route path="*" element={<div style={{ padding: 40 }}>페이지를 찾을 수 없습니다.</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
