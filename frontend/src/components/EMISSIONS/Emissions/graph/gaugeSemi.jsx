import React from "react";

/**
 * 반원 게이지 (실수 값 기반)
 * value: 실측 강도 (kgCO2e/m²·yr)
 * min/max: 게이지 스케일
 * thresholds: [적정 상한, 보통 상한] (예: [70, 160])
 * colors: 각 구간 색
 */
export default function GaugeSemi({
  value = 0,
  size = 140,
  stroke = 18,
  min = 0,
  max = 1000,
  thresholds = [70, 160],
  colors = ["#CFFAE1", "#53E6A8", "#0FA971"], // 필요하면 빨/노/초로 바꿔도 됨
}) {
  const [t1, t2] = thresholds;
  const w = size;
  const h = size / 2;
  const cx = w / 2;
  const cy = h;
  const r = (w - stroke) / 2;

  // 0~1 정규화
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const norm = (x) => clamp01((x - min) / (max - min));

  const r0 = 0;         // min
  const r1 = norm(t1);  // 적정 상한
  const r2 = norm(t2);  // 보통 상한
  const r3 = 1;         // max

  const valueRatio = norm(value);
  const angleRad = (-Math.PI) + (valueRatio * Math.PI); // -180° ~ 0°

  const polar = (cx, cy, radius, ang) => ({
    x: cx + radius * Math.cos(ang),
    y: cy + radius * Math.sin(ang),
  });

  const arcPath = (startRatio, endRatio, color) => {
    const startDeg = -180 + startRatio * 180;
    const endDeg   = -180 + endRatio  * 180;
    const start = polar(cx, cy, r, (startDeg * Math.PI) / 180);
    const end   = polar(cx, cy, r, (endDeg   * Math.PI) / 180);
    const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
    return (
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
      />
    );
  };

  const needleLen = r - stroke * 0.4;
  const needleEnd = polar(cx, cy, needleLen, angleRad);

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={`강도 ${value} kgCO2e/m²·yr`}
    >
      {/* 구간(적정/보통/위험) */}
      {arcPath(r0, r1, colors[0])}
      {arcPath(r1, r2, colors[1])}
      {arcPath(r2, r3, colors[2])}

      {/* 중심 캡 & 바늘 */}
      <circle cx={cx} cy={cy} r={stroke * 0.35} fill="#2B2B2B" />
      <line
        x1={cx}
        y1={cy}
        x2={needleEnd.x}
        y2={needleEnd.y}
        stroke="#2B2B2B"
        strokeWidth={stroke * 0.3}
        strokeLinecap="round"
      />
    </svg>
  );
}