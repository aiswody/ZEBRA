import React, { useEffect, useMemo, useState } from "react";
import logoEarth from "../../../assets/logo_earth.png"; // 상단 카드 아이콘

/**
 * Tier 설문 페이지
 * - 단축키: Y(예), N(아니오), Backspace(뒤로)
 */
export default function TierSurveyPage() {
  // 설문 그래프
  const graph = useMemo(
    () => ({
      Q1: { id: "Q1", text: "만족스러운 QC와 함께 배출 산정치가 이용가능한가?", yes: { next: "Q2" }, no: { next: "Q6" } },
      Q2: { id: "Q2", text: "배출원 부문에서 고유한 모든 배출원이 측정되는가?", yes: { result: "Tier 3" }, no: { next: "Q3" } },
      Q3: { id: "Q3", text: "부문에 대한 특정 연료 사용이 이용가능한가?", yes: { next: "Q4" }, no: { next: "Q6" } },
      Q4: {
        id: "Q4",
        text: (
          <>
            주 카테고리의 측정되지 않은 부분에 대해 <br />
            국가고유 EFs가 이용 가능한가?
          </>
        ),
        yes: { result: "Tier 2" },
        no: { next: "Q5" },
      },
      Q5: { id: "Q5", text: "측정되지 않은 부분이 주 카테고리에 속하는가?", yes: { result: "Tier 2" }, no: { result: "Tier 1" } },
      Q6: { id: "Q6", text: "상세한 산정모형이 이용가능한가?", yes: { next: "Q7" }, no: { next: "Q8" } },
      Q7: {
        id: "Q7",
        text:
          "모형에 의해 산정된 연료 소비는 국가 연료 통계와 일치되거나 독립적인 배출원에 의해 검증될 수 있는가?",
        yes: { result: "Tier 3" },
        no: { next: "Q8" },
      },
      Q8: { id: "Q8", text: "국가 고유 EFs가 이용 가능한가?", yes: { result: "Tier 2" }, no: { next: "Q9" } },
      Q9: { id: "Q9", text: "이는 주 카테고리인가?", yes: { result: "Tier 2" }, no: { result: "Tier 1" } },
    }),
    []
  );

  const TOTAL_QUESTIONS = 6;

  // 상태
  const [currentId, setCurrentId] = useState("Q1");
  const [answers, setAnswers] = useState({});
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);

  // 파생
  const current = currentId ? graph[currentId] : null;
  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.min(
    Math.round(((answeredCount + (result ? 1 : 0)) / TOTAL_QUESTIONS) * 100),
    100
  );

  // 동작
  const handleAnswer = (answer) => {
    if (!current) return;
    const route = current[answer];
    const nextAnswers = { ...answers, [current.id]: answer };
    setAnswers(nextAnswers);
    setHistory((h) => [...h, { qid: current.id, answer }]);

    window.setTimeout(() => {
      if (route?.result) {
        setResult(route.result);
        setCurrentId(null);
      } else if (route?.next) {
        setCurrentId(route.next);
      }
    }, 120);
  };

  const goBack = () => {
    if (history.length === 0 && !result) return;
    if (result) {
      setResult(null);
      const last = history[history.length - 1];
      setCurrentId(last.qid);
      return;
    }
    const newHist = history.slice(0, -1);
    const last = history[history.length - 1];
    const { [last.qid]: _r, ...rest } = answers;
    setAnswers(rest);
    setHistory(newHist);
    setCurrentId(last.qid);
  };

  const restart = () => {
    setAnswers({});
    setHistory([]);
    setResult(null);
    setCurrentId("Q1");
  };

  // 단축키
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (k === "y") handleAnswer("yes");
      if (k === "n") handleAnswer("no");
      if (e.key === "Backspace") goBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, answers, history, result]);

  return (
    <div style={sx.page}>
      {/* 상단 제목 카드 */}
      <section style={sx.topCard}>
        <div style={sx.topLeft}>
          <div style={sx.topTextBox}>
            {/* 아이콘 + 제목 묶음 */}
            <div style={sx.titleRow}>
              <img src={logoEarth} alt="Earth Logo" style={sx.topIcon} />
              <h1 style={sx.topTitle}>탄소 배출량 계산</h1>
            </div>
            {/* 설명문 */}
            <p style={sx.topDesc}>Tier 설문을 통해 Tier(1/2/3)를 판정할 수 있습니다.</p>
          </div>
        </div>
        <div style={sx.topActions}>
          <button onClick={goBack} style={sx.ghostBtn} disabled={history.length === 0 && !result}>
            ← 뒤로
          </button>
          <button onClick={restart} style={sx.ghostBtn}>다시 시작</button>
        </div>
      </section>

      {/* 진행바 + 본문 */}
      <div style={sx.mainWrap}>
        <div style={sx.progressWrap}>
          <div style={{ ...sx.progressBar, width: `${progressPct}%` }} />
        </div>

        {!result && current && (
          <section style={sx.cardWrap}>
            <div style={sx.card}>
              <div style={sx.qid}>{current.id}</div>
              <p style={sx.qtext}>{current.text}</p>

              <div style={sx.btnRow}>
                <button
                  style={{ ...sx.btn, ...(answers[current.id] === "yes" ? sx.btnPrimary : sx.btnGreen) }}
                  onClick={() => handleAnswer("yes")}
                >
                  예 (Y)
                </button>
                <button
                  style={{ ...sx.btn, ...(answers[current.id] === "no" ? sx.btnPrimary : sx.btnGray) }}
                  onClick={() => handleAnswer("no")}
                >
                  아니오 (N)
                </button>
              </div>

              <div style={sx.tip}>단축키 : Y = 예, N = 아니오, Backspace = 뒤로</div>
            </div>

            <aside style={sx.sidebar}>
              <h3 style={sx.sbTitle}>진행 경로</h3>
              <ol style={sx.pathList}>
                {history.map((h, idx) => (
                  <li key={idx} style={sx.pathItem}>
                    <span style={sx.pathQ}>{h.qid}</span>
                    <span style={sx.pathA}>{h.answer === "yes" ? "예" : "아니오"}</span>
                  </li>
                ))}
              </ol>
            </aside>
          </section>
        )}

        {result && (
  <section style={sx.resultWrap}>
    <div style={sx.resultCard}>
      <div style={sx.resultBadge}>{result}</div>
      <h2 style={sx.resultTitle}>판정 결과</h2>
      <p style={sx.resultText}>
        설문 경로를 바탕으로 최종 등급은 <b>{result}</b> 입니다.
      </p>
      <button
        style={sx.restartBtn}
        onClick={restart}
      >
        다시 시작
      </button>
    </div>

    <aside style={sx.sidebar}>
      <h3 style={sx.sbTitle}>진행 경로</h3>
      <ol style={sx.pathList}>
        {history.map((h, idx) => (
          <li key={idx} style={sx.pathItem}>
            <span style={sx.pathQ}>{h.qid}</span>
            <span style={sx.pathA}>{h.answer === "yes" ? "예" : "아니오"}</span>
          </li>
        ))}
      </ol>
    </aside>
  </section>
)}
      </div>
    </div>
  );
}

/* 스타일 */
const sx = {
  page: { maxWidth: "100%", margin: 0, padding: "0 0 40px" },

  /* 상단 제목 카드 */
  topCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "24px 24px 16px",
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,.1)",
    width: "96%",
    margin: "32px 0 24px 0px", 
  },
  topLeft: {
    display: "flex",
    alignItems: "flex-start",
  },

  // 아이콘 + 제목 묶음과 설명을 분리 (여기 핵심)
  topTextBox: {
    display: "flex",
    flexDirection: "column",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,           // 아이콘 ↔ 제목 간 간격
    marginBottom: 30,  // 아이콘+제목 묶음 ↔ 설명 간 간격 (원하면 12~20 조절)
  },

  topIcon: { width: 28, height: 28, objectFit: "contain", display: "block" },
  topTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: "bold",
    lineHeight: "28px",
    color: "#111827",
  },
  topDesc: {
    margin: 0,         // 위쪽 간격은 titleRow의 marginBottom으로 제어
    marginBottom: 15,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: 400,
    lineHeight: "24px",
  },

  topActions: { display: "flex", gap: 8 },
  ghostBtn: {
    height: 34,
    padding: "0 12px",
    borderRadius: 8,
    border: "1px solid #E3E6E8",
    background: "#fff",
    cursor: "pointer",
  },

  /* 본문 컨테이너 */
  mainWrap: {
    width: "100%",
    marginLeft: -3,
    marginTop: 60,
  },

  /* 진행바 */
  progressWrap: {
    height: 6,
    background: "#EDEFF1",
    borderRadius: 999,
    overflow: "hidden",
    margin: "4px 0 20px",
  },
  progressBar: { height: "100%", background: "#2E6B4A", transition: "width .2s" },

  /* 질문 카드 + 사이드바 */
  cardWrap: {
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr) 320px",
    gap: 20,
    alignItems: "start",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
    padding: "28px 24px",
    minHeight: 260,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 14,
  },
  qid: { fontSize: 26, fontWeight: 800, marginTop: 2 },
  qtext: { fontSize: 20, lineHeight: 1.6, margin: "6px 0 10px" },
  btnRow: { display: "flex", gap: 12, marginTop: "auto" },
  btn: {
    minWidth: 100,
    height: 42,
    borderRadius: 10,
    border: "1px solid #dcdcdc",
    background: "#fff",
    cursor: "pointer",
    fontSize: 16,
  },
  btnGreen: { background: "#DCEFE4", borderColor: "#DCEFE4" },
  btnGray: { background: "#F0F1F2", borderColor: "#F0F1F2" },
  btnPrimary: { background: "#2E6B4A", color: "#fff", borderColor: "#2E6B4A" },
  tip: { marginTop: 12, fontSize: 13, color: "#6b6f6d" },

  sidebar: {
    position: "sticky",
    top: 16,
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
    padding: 16,
  },
  sbTitle: { margin: 0, marginBottom: 10, fontSize: 15, fontWeight: 700 },
  pathList: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 },
  pathItem: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 14 },
  pathQ: { fontWeight: 700 },
  pathA: { padding: "2px 8px", borderRadius: 8, background: "#F3F4F6", border: "1px solid #EAECF0" },

  /* 결과 카드 */
  resultWrap: {
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr) 320px",
    gap: 20,
    alignItems: "start",
  },
  resultCard: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
    padding: 28,
    textAlign: "center",
    minHeight: 260,   // ✅ 결과 카드도 동일한 높이 부여
    display: "flex",  // ✅ 내용 정렬 맞춤
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  resultBadge: {
    display: "inline-block",
    marginBottom: 8,
    padding: "6px 12px",
    borderRadius: 999,
    background: "#068729",
    color: "#fff",
    fontWeight: 800,
  },
  resultTitle: { margin: "4px 0 10px", fontSize: 22 },
  resultText: { margin: 0, fontSize: 20 },

  restartBtn: {
    marginTop: 30,
    height: 50,
    minWidth: 200,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(180deg, #068729 0%, #068729 100%)", // 초록 단색
    color: "#fff",
    fontSize: 16,
    fontWeight: 500,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(34,197,94,0.18)",
  },
};
