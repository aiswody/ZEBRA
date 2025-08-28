// src/components/INTRO/pagenav.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function PageNav({
  children,
  style,
  next,
  prev,
  lockMs = 800,
}) {
  const navigate = useNavigate();
  const lockRef = useRef(0);
  const rootRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => rootRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, []);

  const go = (path) => {
    if (!path || typeof path !== "string") {
      console.warn("[PageNav] path가 비어있어요(next/prev props 확인)");
      return;
    }
    const now = Date.now();
    if (now - lockRef.current < lockMs) return;
    lockRef.current = now;
    navigate(path);
  };

  const btnBase = {
    position: "fixed",                 // ✅ 뷰포트 기준
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 32,
    background: "rgba(255,255,255,0.85)",
    border: "none",
    borderRadius: "9999px",
    cursor: "pointer",
    width: 52,
    height: 52,
    display: "grid",
    placeItems: "center",
    boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
    backdropFilter: "blur(2px)",
    transition: "transform .12s ease, background .12s ease",
    zIndex: 9999,                      // ✅ 항상 위에
    pointerEvents: "auto",
  };

  return (
    <section
      ref={rootRef}
      style={{
        minHeight: "100vh",
        position: "relative",
        overscrollBehavior: "contain",
        ...style,
      }}
      tabIndex={0}
      aria-label="intro section (use on-screen arrows to navigate)"
    >
      {/* 좌측 화살표 버튼 */}
      {prev && (
        <button
          type="button"
          onClick={() => go(prev)}
          aria-label="이전 섹션으로"
          style={{ ...btnBase, left: 20 }}
          onMouseDown={(e) =>
            (e.currentTarget.style.transform = "translateY(-50%) scale(0.96)")
          }
          onMouseUp={(e) =>
            (e.currentTarget.style.transform = "translateY(-50%)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(-50%)")
          }
        >
          ‹
        </button>
      )}

      {/* 우측 화살표 버튼 */}
      {next && (
        <button
          type="button"
          onClick={() => go(next)}
          aria-label="다음 섹션으로"
          style={{ ...btnBase, right: 20 }}
          onMouseDown={(e) =>
            (e.currentTarget.style.transform = "translateY(-50%) scale(0.96)")
          }
          onMouseUp={(e) =>
            (e.currentTarget.style.transform = "translateY(-50%)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(-50%)")
          }
        >
          ›
        </button>
      )}

      {children}
    </section>
  );
}
