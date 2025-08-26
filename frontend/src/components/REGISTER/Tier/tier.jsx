import React, { useEffect, useMemo, useState } from "react";

/**
 * Branching survey for Tier determination (Tier 1 / Tier 2 / Tier 3)
 * - 9 questions
 * - Each question routes to the next question or yields a Tier result
 * - Keyboard shortcuts: Y (yes), N (no), Backspace (go back)
 */
export default function TierSurveyPage() {
  // Decision graph (Q1 ~ Q9)
  const graph = useMemo(
    () => ({
      Q1: {
        id: "Q1",
        text: "만족스러운 QC와 함께 배출 산정치가 이용가능한가?",
        yes: { next: "Q2" },
        no: { next: "Q6" },
      },
      Q2: {
        id: "Q2",
        text: "배출원 부문에서 고유한 모든 배출원이 측정되는가?",
        yes: { result: "Tier 3" },
        no: { next: "Q3" },
      },
      Q3: {
        id: "Q3",
        text: "부문에 대한 특정 연료 사용이 이용가능한가?",
        yes: { next: "Q4" },
        no: { next: "Q6" },
      },
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
      Q5: {
        id: "Q5",
        text: "측정되지 않은 부분이 주 카테고리에 속하는가?",
        yes: { result: "Tier 2" },
        no: { result: "Tier 1" },
      },
      Q6: {
        id: "Q6",
        text: "상세한 산정모형이 이용가능한가?",
        yes: { next: "Q7" },
        no: { next: "Q8" },
      },
      Q7: {
        id: "Q7",
        text:
          "모형에 의해 산정된 연료 소비는 국가 연료 통계와 일치되거나 독립적인 배출원에 의해 검증될 수 있는가?",
        yes: { result: "Tier 3" },
        no: { next: "Q8" },
      },
      Q8: {
        id: "Q8",
        text: "국가 고유 EFs가 이용 가능한가?",
        yes: { result: "Tier 2" },
        no: { next: "Q9" },
      },
      Q9: {
        id: "Q9",
        text: "이는 주 카테고리인가?",
        yes: { result: "Tier 2" },
        no: { result: "Tier 1" },
      },
    }),
    []
  );

  const TOTAL_QUESTIONS = 6; // for progress bar max

  // Current node id (question id) or null when finished
  const [currentId, setCurrentId] = useState("Q1");
  // Answers map: { Qid: "yes" | "no" }
  const [answers, setAnswers] = useState({});
  // History stack for back navigation: [{ qid, answer }]
  const [history, setHistory] = useState([]);
  // Final result when reached (e.g., "Tier 2")
  const [result, setResult] = useState(null);

  // Derived state
  const current = currentId ? graph[currentId] : null;
  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.min(
    Math.round(((answeredCount + (result ? 1 : 0)) / TOTAL_QUESTIONS) * 100),
    100
  );

  const handleAnswer = (answer) => {
    if (!current) return;

    const route = current[answer]; // { next? , result? }
    const nextAnswers = { ...answers, [current.id]: answer };
    setAnswers(nextAnswers);
    setHistory((h) => [...h, { qid: current.id, answer }]);

    // small delay for UX
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
    if (history.length === 0) return;

    if (result) {
      // Leaving result screen -> back to last question
      setResult(null);
      const last = history[history.length - 1];
      setCurrentId(last.qid);
      return;
    }

    const newHist = history.slice(0, -1);
    const last = history[history.length - 1];

    // Remove last answer
    const { [last.qid]: _removed, ...rest } = answers;
    setAnswers(rest);
    setHistory(newHist);

    // Move back to that question
    setCurrentId(last.qid);
  };

  const restart = () => {
    setAnswers({});
    setHistory([]);
    setResult(null);
    setCurrentId("Q1");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === "y") handleAnswer("yes");
      if (e.key.toLowerCase() === "n") handleAnswer("no");
      if (e.key === "Backspace") goBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, answers, history, result]);

  return (
    <div style={sx.page}>
      <header style={sx.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={sx.bullet} />
          <h1 style={sx.title}>탄소 배출량 계산 · Tier 설문</h1>
        </div>
        <div style={sx.rightHead}>
          <button onClick={goBack} style={sx.ghostBtn} disabled={history.length === 0 && !result}>
            ← 뒤로
          </button>
          <button onClick={restart} style={sx.ghostBtn}>다시 시작</button>
        </div>
      </header>

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

            <div style={sx.tip}>단축키: Y = 예, N = 아니오, Backspace = 뒤로</div>
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
              style={{ ...sx.btn, ...sx.btnPrimary, minWidth: 140, marginTop: 30 }} // 버튼 아래 여백
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
  );
}

const sx = {
  page: { maxWidth: 980, margin: "0 auto", padding: "24px 20px 80px" },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  bullet: { width: 14, height: 14, borderRadius: 99, background: "#2E6B4A", display: "inline-block" },
  title: { fontSize: 18, fontWeight: 800, margin: 0 },
  rightHead: { display: "flex", gap: 8 },
  ghostBtn: {
    height: 36,
    padding: "0 12px",
    borderRadius: 10,
    border: "1px solid #E3E6E8",
    background: "#fff",
    cursor: "pointer",
  },

  progressWrap: { height: 6, background: "#EDEFF1", borderRadius: 999, overflow: "hidden", margin: "8px 0 20px" },
  progressBar: { height: "100%", background: "#2E6B4A", transition: "width .2s" },

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
  qid: { fontSize: 26, fontWeight: 800, marginTop: 2 },       // 커짐
  qtext: { fontSize: 20, lineHeight: 1.6, margin: "6px 0 10px" }, // 커짐
  btnRow: { display: "flex", gap: 12, marginTop: "auto" },
  btn: { minWidth: 100, height: 42, borderRadius: 10, border: "1px solid #dcdcdc", background: "#fff", cursor: "pointer", fontSize: 16 },
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

  resultWrap: {
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr) 320px",
    gap: 20,
    alignItems: "start",
  },
  resultCard: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 10px 26px rgba(0,0,0,0.10)",
    padding: 28,
    textAlign: "center",
  },
  resultBadge: {
    display: "inline-block",
    marginBottom: 8,
    padding: "6px 12px",
    borderRadius: 999,
    background: "#2E6B4A",
    color: "#fff",
    fontWeight: 800,
  },
  resultTitle: { margin: "4px 0 10px", fontSize: 22 },
  resultText: { margin: 0, fontSize: 20 },
};
