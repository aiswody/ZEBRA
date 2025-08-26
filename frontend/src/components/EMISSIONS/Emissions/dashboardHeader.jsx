import React, { useEffect, useState } from "react";
import { FaRegFilePdf } from "react-icons/fa";
import { FiShare2, FiSave } from "react-icons/fi";
import { header, title } from "./emission.styles";
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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/buildings/"); // baseURL=/api
        const rows = Array.isArray(data) ? data : (data?.results || []);
        const opts = rows.map(({ id, name }) => ({ id: String(id), name }));
        if (!mounted) return;
        setOptions(opts);
        if (opts.length) {
          setSelected(opts[0].id);
          onSelectBuilding?.(opts[0].id);
        }
      } catch (e) {
        console.error("건물 목록 로드 실패", e);
        setOptions([]);
        setSelected("");
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const id = e.target.value;
    setSelected(id);
    onSelectBuilding?.(id);
  };

  return (
    <header
      style={{
        ...header,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "12px 20px",
        borderBottom: "1px solid #E5E7EB",
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={appLogo}
            alt=""
            style={{ width: 28, height: 28, objectFit: "contain", display: "block" }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <h1 style={{ ...title, fontSize: 18, margin: 0 }}>
            공공건축물 탄소 절감을 위한 대시보드
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={orgText}>{orgName || "기관명 불러오는 중…"}</span>

          <select
            aria-label="그래프를 보고 싶은 건물 선택"
            value={selected}
            onChange={handleChange}
            style={selectStyle}
          >
            <option value="">
              {loading ? "건물 목록 불러오는 중…" : "그래프를 보고 싶은 건물 선택"}
            </option>
            {options.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button style={buttonStyle} onClick={onSave}>
          <FiSave style={{ marginRight: 6 }} /> 결과 저장
        </button>
        <button style={buttonStyle} onClick={onShare}>
          <FiShare2 style={{ marginRight: 6 }} /> 공유하기
        </button>
        <button style={buttonStyle} onClick={onExportPdf}>
          <FaRegFilePdf style={{ marginRight: 6 }} /> PDF 출력
        </button>
      </div>
    </header>
  );
}

const orgText = {
  fontSize: 18,
  fontWeight: 700,
  color: "#14532d",
  lineHeight: 1,
};
const selectStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #D1D5DB",
  fontSize: 16,
  width: 360,
  background: "#fff",
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
};
