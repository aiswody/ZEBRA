// src/components/INTRO/pagenav.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function PageNav({
  children,
  style,
  next,
  prev,
  lockMs = 800,            // 전환 후 쿨다운 (늘리면 더 느긋해짐)
  wheelThreshold = 180,    // 누적 휠 임계값 (키워서 덜 민감하게)
  wheelWindowMs = 300,     // 누적 시간창 (줄이면 '짧게 세게'만 반응)
  preventDefaultOnWheel = true, // 기본 스크롤 막기
}) {
  const navigate = useNavigate();
  const lockRef = useRef(0);
  const touchStartY = useRef(null);
  const rootRef = useRef(null);

  // 휠 누적용
  const wheelAccum = useRef(0);
  const lastWheelTs = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => rootRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, []);

  const go = (path) => {
    const now = Date.now();
    if (now - lockRef.current < lockMs) return;
    lockRef.current = now;
    if (path) navigate(path);
  };

  const normalizeDeltaY = (e) => {
    // deltaMode: 0=px, 1=line, 2=page
    const LINE_HEIGHT = 16; // 대략적인 line 높이(px) 가정
    const PAGE_HEIGHT = window.innerHeight || 800;
    if (e.deltaMode === 1) return e.deltaY * LINE_HEIGHT;
    if (e.deltaMode === 2) return e.deltaY * PAGE_HEIGHT;
    return e.deltaY; // 이미 px
  };

  const handleWheel = (e) => {
    const now = Date.now();
    const dy = normalizeDeltaY(e);

    // 시간창 벗어나면 누적 리셋
    if (now - lastWheelTs.current > wheelWindowMs) {
      wheelAccum.current = 0;
    }
    lastWheelTs.current = now;

    wheelAccum.current += dy;

    const hitNext = wheelAccum.current > wheelThreshold;
    const hitPrev = wheelAccum.current < -wheelThreshold;

    if (hitNext || hitPrev) {
      if (preventDefaultOnWheel) e.preventDefault();
      if (hitNext) go(next);
      else go(prev);
      // 전환 후 누적값 초기화
      wheelAccum.current = 0;
    }
  };

  return (
    <section
      ref={rootRef}
      style={{ minHeight: "100vh", ...style }}
      onWheelCapture={handleWheel} // capture 단계에서 먼저 잡기
      onTouchStart={(e) => {
        touchStartY.current = e.changedTouches[0].clientY;
      }}
      onTouchEnd={(e) => {
        const dy = e.changedTouches[0].clientY - (touchStartY.current ?? 0);
        const TH = 60; // 스와이프 임계값도 살짝 올려 안정감
        if (dy < -TH) go(next);
        if (dy > TH) go(prev);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") go(next);
        if (e.key === "ArrowUp" || e.key === "PageUp") go(prev);
        if (e.key === "Home") go(prev);
        if (e.key === "End") go(next);
      }}
      tabIndex={0}
      aria-label="intro section (wheel, swipe, arrow/page keys to navigate)"
    >
      {children}
    </section>
  );
}
