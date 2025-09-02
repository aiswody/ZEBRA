import React, { useEffect, useState } from "react";
import { FaRegFilePdf } from "react-icons/fa";
import { FiShare2, FiSave, FiChevronDown } from "react-icons/fi";
import appLogo from "../../../assets/logo.png";
import { api } from "../../../api/client";
import { useAuth } from "../../../contexts/authContext";

export default function DashboardHeader({
  initialOrgName,
  onSelectBuilding,
  onSave, onShare, onExportPdf,
}) {
  const { user } = useAuth();

  const [orgName, setOrgName] = useState(initialOrgName || user?.institutionName || "");
  useEffect(() => {
    if (initialOrgName) setOrgName(initialOrgName);
    else if (user?.institutionName) setOrgName(user.institutionName);
  }, [initialOrgName, user?.institutionName]);

  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // 건물 목록 로드
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const { data } = await api.get("/buildings/");
        const rows = Array.isArray(data) ? data : (data?.results || []);
        const opts = rows.map(({ id, name }) => ({ id: String(id), name: String(name || "이름 없음") }));
        if (!mounted) return;
        setOptions(opts);

        if (!selected && opts.length) {
          setSelected(opts[0].id);
          onSelectBuilding?.(opts[0].id);
        }
      } catch (e) {
        console.error("건물 목록 로드 실패", e);
        if (mounted) {
          setOptions([]);
          setSelected("");
          setErrorMsg("건물 목록을 불러오지 못했어요. 새로고침하거나 관리자에게 문의해 주세요.");
        }
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const id = e.target.value;
    setSelected(id);
    onSelectBuilding?.(id);
  };

  return (
    <div style={cardStyle}>
      <header style={headerStyle}>
        {/* 좌측: 로고/제목 + 기관/건물 선택 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 280, flex: "1 1 440px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, minHeight: 28 }}>
            <img
              src={appLogo}
              alt=""
              style={{ width: 28, height: 28, objectFit: "contain", display: "block" }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            <h1 style={titleStyle}> 
              공공건축물 탄소 절감을 위한 대시보드
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={orgText}>{orgName || "기관명 불러오는 중…"}</span>

            <label htmlFor="buildingSelect" style={{ position: "absolute", left: -10000, width: 1, height: 1, overflow: "hidden" }}>
              그래프를 보고 싶은 건물 선택
            </label>

            {/* ▼ 셀렉트 + 화살표 아이콘 */}
            <div style={selectWrap}>
              <select
                id="buildingSelect"
                aria-label="그래프를 보고 싶은 건물 선택"
                value={selected}
                onChange={handleChange}
                style={selectStyle}
                disabled={loading || !!errorMsg}
              >
                <option value="">
                  {loading ? "건물 목록 불러오는 중…" : (options.length ? "건물 선택" : "건물이 없습니다")}
                </option>
                {options.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <FiChevronDown aria-hidden="true" style={chevStyle} />
            </div>
          </div>

          {errorMsg && (
            <p style={{ margin: 0, marginTop: 4, fontSize: 13, color: "#b91c1c" }}>
              {errorMsg}
            </p>
          )}
        </div>

        {/* 우측: 액션 버튼들 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button style={buttonStyle} onClick={onSave} aria-label="결과 저장">
            <FiSave style={{ marginRight: 6 }} />
            <span>결과 저장</span>
          </button>
          <button style={buttonStyle} onClick={onShare} aria-label="공유하기">
            <FiShare2 style={{ marginRight: 6 }} />
            <span>공유하기</span>
          </button>
          <button style={{ ...buttonStyle, backgroundColor: "#f8fafc" }} onClick={onExportPdf} aria-label="PDF로 내보내기">
            <FaRegFilePdf style={{ marginRight: 6 }} />
            <span>PDF 출력</span>
          </button>
        </div>
      </header>
    </div>
  );
}

/* ───────── 스타일 ───────── */
const cardStyle = {
  background: "#fff",
  padding: "24px",              // ← 카드 내부 패딩 24px
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,.1)",
  marginTop: "-3px",            // ← 위쪽 외부 여백 32px
  marginBottom: "20px",
  marginLeft: "2px"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  flexWrap: "wrap"
};

const titleStyle = {
  fontSize: 22,                 // ← 폰트 크기 22px
  fontWeight: "bold",           // ← bold
  margin: 0,                    // ← 기본 margin 제거
  color: "#111827"
};

const orgText = {
  fontSize: 16,
  fontWeight: 600,
  color: "#14532d",
  lineHeight: 1.4,
};

const selectWrap = {
  position: "relative",
  width: "clamp(180px, 24vw, 320px)",
  flex: "0 0 auto",
};

const selectStyle = {
  padding: "10px 14px",
  paddingRight: "40px",
  borderRadius: 10,
  border: "1px solid #D1D5DB",
  fontSize: 16,
  width: "100%",
  background: "#fff",
  outline: "none",
  appearance: "none",
  cursor: "pointer",
};

const chevStyle = {
  position: "absolute",
  right: 12,
  top: "50%",
  transform: "translateY(-50%)",
  pointerEvents: "none",
  fontSize: 18,
  color: "#94A3B8",
};

const buttonStyle = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  padding: "8px 14px",
  fontSize: 14,
  border: "1px solid #D1D5DB",
  borderRadius: 10,
  backgroundColor: "#fff",
  cursor: "pointer",
  lineHeight: 1.25,
  transition: "box-shadow .15s ease, transform .02s ease",
};
