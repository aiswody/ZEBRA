import React from "react";

export default function GaugeSemi({ value = 65, size = 140, stroke = 18 }) {
  const w = size;
  const h = size / 2;
  const cx = w / 2;
  const cy = h;
  const r = (w - stroke) / 2;
  const clamped = Math.max(0, Math.min(100, value));

  const angle = (-180 + (clamped * 180) / 100) * (Math.PI / 180);

  const polarToCartesian = (centerX, centerY, radius, angleRad) => ({
    x: centerX + radius * Math.cos(angleRad),
    y: centerY + radius * Math.sin(angleRad),
  });

  const arcPath = (startDeg, endDeg, color) => {
    const start = polarToCartesian(cx, cy, r, (startDeg * Math.PI) / 180);
    const end = polarToCartesian(cx, cy, r, (endDeg * Math.PI) / 180);
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
  const needleEnd = polarToCartesian(cx, cy, needleLen, angle);

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`이행률 ${clamped}%`}>
      {arcPath(-180, -120, "#CFFAE1")}
      {arcPath(-120, -60, "#53E6A8")}
      {arcPath(-60, 0, "#0FA971")}
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
