import React, { useEffect, useState } from "react";
import heroTop from "../../../assets/hero-right.png";         // 우측 일러스트
import logoChart from "../../../assets/logo_chart.png";       // 상단 카드 아이콘
import { downloadReport, fetchReportContext } from "api/client";
import { fetchMe } from "api/auth"; // /auth/me 호출

export default function ReportsDownload() {
  const [scope, setScope] = useState("TOTAL");
  const [yearRange, setYearRange] = useState({ from: "", to: "" });

  // 내정보 기반 기관 정보
  const [orgName, setOrgName] = useState("");
  const [loadingMe, setLoadingMe] = useState(true);

  // 낮은 화면 최적화
  const [isShort, setIsShort] = useState(false);
  useEffect(() => {
    const onResize = () => setIsShort(window.innerHeight < 820);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ───────── 기관명/ID: 내정보 API로 자동 세팅 ─────────
  useEffect(() => {
    (async () => {
      try {
        const me = await fetchMe();

        const name =
          me?.institution?.name ??
          me?.institution_name ??
          me?.institutionName ??
          "";

        setOrgName(name);
      } catch (e) {
        console.warn("fetchMe failed", e);
      } finally {
        setLoadingMe(false);
      }
    })();
  }, []);

  // 파일명에서 금지문자 제거 + 길이 제한
  const sanitize = (s) =>
    String(s || "")
      .replace(/[\\/:*?"<>|]/g, "-")
      .replace(/\s+/g, "_")
      .slice(0, 80);

  // 서버 헤더에서 파일명 파싱
  const getFilenameFromHeader = (cd, year) => {
    if (!cd) return `report_${year}.docx`;
    const m = String(cd).match(/filename\*?=(?:UTF-8'')?([^;]+)/i);
    if (m && m[1]) return decodeURIComponent(m[1].replace(/"/g, ""));
    const m2 = String(cd).match(/filename="?([^"]+)"?/i);
    if (m2 && m2[1]) return m2[1];
    return `report_${year}.docx`;
  };

  // ✅ 다운로드 핸들러 (파일명: 기관명_연도.docx 우선)
  const handleDownload = async () => {
    try {
      const year = yearRange.from;

      // 1) 컨텍스트에서 기관명 우선 시도, 없으면 내정보(orgName) 사용
      let instName = orgName || null;
      try {
        const ctx = await fetchReportContext(year); // /reports/context
        const ctxData = ctx?.data ?? ctx; // axios 응답/바디 둘 다 커버
        instName =
          ctxData?.institution_name ??
          ctxData?.institution?.name ??
          instName;
      } catch {
        // 컨텍스트 실패해도 진행
      }

      // 2) 파일 다운로드
      const res = await downloadReport(year); // /reports/download

      // 3) 파일명: 서버 헤더 우선, 없으면 기관명_연도.docx
      const cd = res.headers?.["content-disposition"];
      let filename = getFilenameFromHeader(cd, year);
      if (!cd && instName) filename = `${sanitize(instName)}_${year}.docx`;

      const blob = new Blob([res.data], {
        type:
          res.headers?.["content-type"] ||
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e?.response?.data?.detail || "보고서 다운로드 실패");
    }
  };

  return (
    <div style={sx.page}>
      {/* 상단 안내 카드 */}
      <section style={sx.infoCard}>
        <div style={sx.infoInner}>
          <div style={sx.titleRow}>
            <img src={logoChart} alt="Chart Logo" style={sx.infoIcon} />
            <h2 style={sx.infoTitle}>전체 리포트 다운로드</h2>
          </div>
          <p style={sx.infoDesc}>필터를 선택하고 형식을 골라 내려받으세요.</p>
        </div>
      </section>

      {/* 히어로 카드 */}
      <section
        style={{
          ...sx.heroCard,
          height: "clamp(380px, 50vh, 460px)",
          gridTemplateColumns: isShort ? "1fr" : "1fr 1fr",
        }}
      >
        <div style={sx.heroLeft}>
          <h1 style={sx.title}>기간 선택</h1>
          <p style={sx.subtitle}>시작연도를 선택하세요.</p>
          <div style={sx.hr} />

          <div style={sx.formCol}>
            <label style={{ ...sx.label, marginTop: 12 }}>시작연도(From)</label>
            <div style={sx.inputWrap}>
              <span style={sx.leadingIcon} aria-hidden>📅</span>
              <input
                type="number"
                placeholder="시작연도를 입력하세요"
                value={yearRange.from}
                onChange={(e) =>
                  setYearRange((v) => ({ ...v, from: Number(e.target.value) || v.from }))
                }
                style={sx.input}
              />
              <span style={sx.trailingCaret} aria-hidden>▾</span>
            </div>

            <label style={{ ...sx.label, marginTop: 8 }}>기관</label>
            <div style={sx.inputWrap}>
              <span style={sx.leadingIcon} aria-hidden>🏢</span>
              <input
                placeholder={loadingMe ? "불러오는 중..." : "기관명"}
                value={orgName}
                readOnly
                style={{ ...sx.input, color: orgName ? "#111827" : "#9CA3AF" }}
              />
              <span style={sx.trailingCaret} aria-hidden>▾</span>
            </div>

            <button style={sx.primaryBtn} onClick={handleDownload}>
              보고서 다운로드
            </button>
          </div>
        </div>

        {!isShort && (
          <div style={sx.heroRight}>
            <img
              src={heroTop}
              alt="illustration"
              style={{
                ...sx.illustration,
                // 오른쪽 라운드가 확실히 보이도록 보강
                borderTopRightRadius: 16,
                borderBottomRightRadius: 16,
              }}
            />
          </div>
        )}
      </section>

      {/* 숨김 블록 */}
      <div style={sx.filtersHidden}>
        <div style={sx.filterItemHidden}>
          <label style={sx.label}>Scope</label>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            style={sx.selectHidden}
          >
            <option value="TOTAL">Total</option>
            <option value="SCOPE1">Scope 1</option>
            <option value="SCOPE2">Scope 2</option>
          </select>
        </div>
        <div style={sx.filterItemHidden}>
          <label style={sx.label}>끝연도(To)</label>
          <input
            type="number"
            value={yearRange.to}
            onChange={(e) =>
              setYearRange((v) => ({ ...v, to: Number(e.target.value) || v.to }))
            }
            style={sx.inputHidden}
          />
        </div>
      </div>

      <div style={sx.note}>* 상세 범위(Scope)와 시작연도는 기본값으로 설정되었습니다.</div>
    </div>
  );
}

/* ───────── 스타일 ───────── */
const sx = {
  page: {
    // ▶ 좌우 여백 확보 + 클리핑 해제: 오른쪽 그림자/모서리 보이게
    padding: "0 12px 40px",
    background: "#f5f7f8",
    minHeight: "100vh",
    boxSizing: "border-box",
    overflow: "visible",
    maxWidth: "100%",
    margin: 0,
    paddingTop: "0px",
  },

  /* 상단 안내 카드: 대칭 그림자로 통일 */
  infoCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "24px",
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,.10)", // ← 왼쪽 강조 제거, 대칭
    width: "100%",                          // ← 95% → 100%
    margin: "-2px 0 20px -9px",                 // 좌우 여백은 page 패딩으로
    boxSizing: "border-box",
  },

  infoInner: { display: "flex", flexDirection: "column" },
  titleRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 40 },
  infoIcon: { width: 28, height: 28, objectFit: "contain", display: "block" },
  infoTitle: { margin: 0, fontSize: 22, fontWeight: "bold", lineHeight: "28px", color: "#111827" },
  infoDesc: { margin: 0, marginBottom: 15, fontSize: 16, color: "#6B7280", fontWeight: 400, lineHeight: "24px" },

  /* 기간 선택 카드: 대칭 그림자 + 오른쪽 라운드 보강 */
  heroCard: {
    width: "100%",                           // ← 95% → 100%
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)", // ← 왼쪽 강조 제거, 대칭
    display: "grid",
    overflow: "hidden",                       // 내부 콘텐츠(이미지) 클리핑
    boxSizing: "border-box",
    margin: "40px 0 20px -9px",
  },
  heroLeft: { padding: "22px 22px 22px 26px", display: "flex", flexDirection: "column" },
  heroRight: { position: "relative", width: "100%", height: "100%" },
  illustration: { width: "100%", height: "100%", objectFit: "cover", display: "block" },

  title: { margin: 0, marginBottom: 8, fontSize: 20, fontWeight: 600, color: "#0f172a" },
  subtitle: { margin: "4px 0 12px", fontSize: 14, color: "#475569" },
  hr: { height: 1, background: "#e5e7eb", margin: "10px 0 14px" },

  formCol: { display: "flex", flexDirection: "column", gap: 0, maxWidth: "100%", width: "100%" },
  label: { fontSize: 12, color: "#475569", marginBottom: 4 },

  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    height: 44,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    padding: "0 44px",
    marginTop: 4,
    marginBottom: 8,
    width: "85%",
  },
  input: { width: "100%", height: "100%", border: "none", outline: "none", fontSize: 16, color: "#111827", background: "transparent" },
  leadingIcon: { position: "absolute", left: 12, fontSize: 18, opacity: 0.9 },
  trailingCaret: { position: "absolute", right: 12, fontSize: 16, opacity: 0.5, transform: "translateY(-1px)" },

  primaryBtn: {
    marginTop: 70,
    height: 50,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(180deg, #068729 0%, #068729 100%)",
    color: "#fff",
    fontSize: 16,
    fontWeight: 500,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(34,197,94,0.18)",
    width: 180,
  },

  filtersHidden: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0,1fr))",
    gap: 12,
    marginTop: 0,
    height: 0,
    overflow: "hidden",
  },
  filterItemHidden: { display: "flex", flexDirection: "column", gap: 6 },
  selectHidden: { height: 0, padding: 0, border: "none", outline: "none", opacity: 0 },
  inputHidden: { height: 0, padding: 0, border: "none", outline: "none", opacity: 0 },

  note: { color: "#64748b", fontSize: 12, margin: "8px 16px 0" },
};
