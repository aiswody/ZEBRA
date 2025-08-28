import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Cell,
} from "recharts";

/**
 * 용도별 비교 그래프
 * - buildingId가 주어지면 API 모드(벤치마크 사용)
 * - buildingId가 없으면 부모가 넘긴 숫자로 수동 모드
 */
export default function Graph2({
  // API 모드(우선)
  buildingId,
  year,
  scope = "total",

  // 수동 모드 값
  buildingTotal,
  usageAvgTotal,

  title = "용도별 배출량(면적당 합)",
}) {
  const [buildingVal, setBuildingVal] = useState(0);
  const [avgVal, setAvgVal] = useState(0);
  const [unit, setUnit] = useState("kgCO2eq/m2");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const endpoint = useMemo(() => {
    const s = scope === "scope1" || scope === "scope2" ? scope : "total";
    return buildingId ? `/api/dashboard/buildings/${buildingId}/${s}/use-compare` : null;
  }, [buildingId, scope]);

  // ─ API 모드
  useEffect(() => {
    if (!endpoint) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await axios.get(endpoint, { params: { year } });
        if (!alive) return;
        setUnit(data?.building?.unit || "kgCO2eq/m2");
        setBuildingVal(Number(data?.building?.intensity ?? 0));
        setAvgVal(Number(data?.category_avg?.intensity ?? 0)); // use_intensity의 벤치마크
      } catch {
        if (!alive) return;
        setErr("데이터를 불러오지 못했습니다.");
        setBuildingVal(0);
        setAvgVal(0);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [endpoint, year]);

  // ─ 수동 모드 (id가 없을 때)
  useEffect(() => {
    if (buildingId) return; // API 모드면 무시
    setErr("");
    setUnit("kgCO2eq/m2");
    setBuildingVal(Number(buildingTotal ?? 0));
    setAvgVal(Number(usageAvgTotal ?? 0));
  }, [buildingId, buildingTotal, usageAvgTotal]);

  const data = [
    { name: "해당 건물", value: buildingVal || 0, fill: "#16a34a" },
    { name: "평균", value: avgVal || 0, fill: "#16a34a54" },
  ];

  const formatNumber = (v) =>
    typeof v === "number"
      ? (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(3))
      : v;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={tooltipBox}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
          {payload.map((p, i) => (
            <div key={i}>
              {formatNumber(p.value)} {unit}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={card}>
      <div style={headerRow}>
        <p style={titleStyle}>{title}</p>
        <small style={unitStyle}>
          단위: <b>{unit}</b>{scope !== "total" ? ` · ${scope.toUpperCase()}` : ""}
        </small>
      </div>

      <div style={{ height: 300 }}>
        {err ? (
          <div style={errorBox}>{err}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fill: "#6B7280" }} tickFormatter={formatNumber} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fill: "#374151", fontWeight: 700 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" barSize={35} radius={[3, 3, 3, 3]}>
                {data.map((entry, idx) => (<Cell key={`cell-${idx}`} fill={entry.fill} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {loading && <div style={loadingBar}>불러오는 중…</div>}
    </div>
  );
}

const card = { background: "#fff", borderRadius: 16, boxShadow: "0 2px 6px rgba(0,0,0,0.06)", padding: 16 };
const titleStyle = { fontSize: 14, color: "#4B5563", margin: 0 };
const headerRow = { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 };
const unitStyle = { color: "#6B7280" };
const tooltipBox = { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 10px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" };
const errorBox = { height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12 };
const loadingBar = { marginTop: 8, fontSize: 12, color: "#6B7280" };
