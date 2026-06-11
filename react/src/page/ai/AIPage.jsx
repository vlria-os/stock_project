import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../../api/aiAPI";

const SUGGESTIONS = [
  "이 종목 지금 사도 될까요?",
  "최근 주가 흐름을 분석해줘",
  "이 종목의 투자 리스크는?",
  "비슷한 업종 종목과 비교해줘",
];

const GENERAL_SUGGESTIONS = [
  "요즘 주목할 만한 종목 추천해줘",
  "초보 투자자가 알아야 할 것들",
  "KOSPI와 KOSDAQ 차이가 뭐야?",
  "분산 투자란 무엇인가요?",
];

export default function AIPage({ stockCode, stockName, onNavigate }) {
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: "ai",
      content: stockCode
        ? `안녕하세요! **${stockName}(${stockCode})** 에 대해 궁금한 점을 물어보세요. 투자 분석, 리스크, 전망 등 무엇이든 도와드릴게요.`
        : "안녕하세요! AI 투자 어시스턴트입니다. 종목 분석, 투자 전략, 시장 동향 등 궁금한 점을 물어보세요.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = async (text) => {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    setInput("");

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", content: msg },
    ]);
    setLoading(true);

    try {
      const data = await sendMessage(msg, stockCode);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "ai", content: data.answer ?? String(data) },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "ai", content: "죄송합니다, 응답을 가져오지 못했습니다. 잠시 후 다시 시도해주세요." },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const suggestions = stockCode ? SUGGESTIONS : GENERAL_SUGGESTIONS;

  return (
    <div style={s.page}>
      {/* 헤더 */}
      <div style={s.pageHeader}>
        <div style={s.titleRow}>
          <span style={s.titleIcon}>🤖</span>
          <div>
            <div style={s.title}>AI 투자 어시스턴트</div>
            <div style={s.subtitle}>투자 분석 및 종목 관련 질문에 답해드립니다</div>
          </div>
        </div>
        {stockCode && (
          <div style={s.stockChip}>
            <span style={s.chipDot} />
            <span style={s.chipText}>{stockName}</span>
            <span style={s.chipCode}>{stockCode}</span>
            <button
              onClick={() => onNavigate?.("market")}
              style={s.chipClose}
              title="종목 컨텍스트 해제"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 채팅 영역 */}
      <div style={s.chatArea}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{ ...s.msgRow, ...(m.role === "user" ? s.msgRowUser : {}) }}
          >
            {m.role === "ai" && <div style={s.aiAvatar}>🤖</div>}
            <div
              style={{
                ...s.bubble,
                ...(m.role === "user" ? s.bubbleUser : s.bubbleAi),
              }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={s.msgRow}>
            <div style={s.aiAvatar}>🤖</div>
            <div style={{ ...s.bubble, ...s.bubbleAi, ...s.bubbleLoading }}>
              <span style={s.dot} />
              <span style={{ ...s.dot, animationDelay: "0.2s" }} />
              <span style={{ ...s.dot, animationDelay: "0.4s" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 추천 질문 */}
      {messages.length <= 1 && !loading && (
        <div style={s.suggestions}>
          {suggestions.map((q) => (
            <button key={q} onClick={() => submit(q)} style={s.suggestionBtn}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* 입력창 */}
      <div style={s.inputRow}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="질문을 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
          style={s.textarea}
          rows={2}
          disabled={loading}
        />
        <button
          onClick={() => submit()}
          disabled={!input.trim() || loading}
          style={{
            ...s.sendBtn,
            ...(!input.trim() || loading ? s.sendBtnDisabled : {}),
          }}
        >
          전송
        </button>
      </div>

      <style>{dotAnim}</style>
    </div>
  );
}

const dotAnim = `
@keyframes blink {
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
`;

const s = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 56px - 64px)",
    minHeight: 500,
  },
  pageHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 10,
  },
  titleRow: { display: "flex", alignItems: "center", gap: 12 },
  titleIcon: { fontSize: 32 },
  title: { fontSize: 20, fontWeight: 700, color: "var(--text-h)" },
  subtitle: { fontSize: 13, color: "var(--text)", marginTop: 2 },
  stockChip: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "var(--accent-bg, rgba(170,59,255,0.1))",
    border: "1px solid var(--accent)",
    borderRadius: 20,
    padding: "5px 12px",
    fontSize: 13,
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "var(--accent)",
    flexShrink: 0,
  },
  chipText: { fontWeight: 600, color: "var(--text-h)" },
  chipCode: { color: "var(--text)", fontSize: 12 },
  chipClose: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text)",
    fontSize: 13,
    padding: "0 2px",
    lineHeight: 1,
  },
  chatArea: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    border: "1px solid var(--border)",
    borderRadius: 12,
    marginBottom: 10,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    background: "var(--bg)",
  },
  msgRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
  },
  msgRowUser: { flexDirection: "row-reverse" },
  aiAvatar: {
    fontSize: 22,
    flexShrink: 0,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: "72%",
    padding: "10px 14px",
    borderRadius: 14,
    fontSize: 14,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  bubbleAi: {
    background: "var(--accent-bg, rgba(170,59,255,0.08))",
    border: "1px solid var(--border)",
    color: "var(--text-h)",
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    background: "var(--accent, #aa3bff)",
    color: "#fff",
    borderBottomRightRadius: 4,
  },
  bubbleLoading: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "12px 16px",
  },
  dot: {
    display: "inline-block",
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "var(--accent, #aa3bff)",
    animation: "blink 1.2s infinite ease-in-out",
  },
  suggestions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  suggestionBtn: {
    background: "none",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: "6px 14px",
    fontSize: 13,
    color: "var(--text)",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  inputRow: {
    display: "flex",
    gap: 8,
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid var(--border)",
    borderRadius: 10,
    fontSize: 14,
    color: "var(--text-h)",
    background: "var(--bg)",
    outline: "none",
    resize: "none",
    fontFamily: "inherit",
    lineHeight: 1.5,
  },
  sendBtn: {
    padding: "10px 20px",
    background: "var(--accent, #aa3bff)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    alignSelf: "stretch",
  },
  sendBtnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
};
