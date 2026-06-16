import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { chatOrder } from '../../api/chatAPI';

const WELCOME = {
  role: 'assistant',
  content: '안녕하세요! 주식 주문 AI 어시스턴트입니다 🤖\n자연어로 주문을 말씀해 주시면 대신 처리해 드립니다.\n\n예시\n• "삼성전자 10주 시장가로 매수해줘"\n• "카카오 5주 지정가 45000원에 매도해줘"',
};

const ChatOrder = () => {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [threadId] = useState(() => uuidv4());
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await chatOrder(threadId, userMessage.content);
      setMessages(prev => [...prev, { role: 'assistant', content: res.message }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '죄송합니다, 요청을 처리하는 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.',
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={s.wrap}>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        .dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--text); opacity: 0.5; margin: 0 2px; animation: bounce 1.2s infinite; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        textarea:focus { outline: none; border-color: var(--accent) !important; }
        textarea { resize: none; }
        .chat-row:last-child { border-bottom: none; }
      `}</style>

      {/* 헤더 */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.botAvatar}>🤖</div>
          <div>
            <div style={s.botName}>주문 AI 어시스턴트</div>
            <div style={s.botStatus}>
              <span style={s.statusDot} />
              온라인
            </div>
          </div>
        </div>
        <div style={s.headerRight}>
          <span style={s.threadBadge}>thread · {threadId.slice(0, 8)}</span>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div style={s.messageArea}>
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div key={i} style={{ ...s.row, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
              {!isUser && <div style={s.avatar}>🤖</div>}
              <div style={{
                ...s.bubble,
                ...(isUser ? s.bubbleUser : s.bubbleBot),
                ...(msg.isError ? s.bubbleError : {}),
              }}>
                {msg.content.split('\n').map((line, j) => (
                  <span key={j}>{line}{j < msg.content.split('\n').length - 1 && <br />}</span>
                ))}
              </div>
            </div>
          );
        })}

        {/* 타이핑 인디케이터 */}
        {isLoading && (
          <div style={{ ...s.row, justifyContent: 'flex-start' }}>
            <div style={s.avatar}>🤖</div>
            <div style={{ ...s.bubble, ...s.bubbleBot, ...s.typingBubble }}>
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div style={s.inputArea}>
        <textarea
          ref={inputRef}
          style={s.textarea}
          placeholder='주문을 입력하세요 (Enter로 전송, Shift+Enter로 줄바꿈)'
          value={input}
          rows={2}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button
          type="button"
          style={{
            ...s.sendBtn,
            ...(input.trim() && !isLoading ? s.sendBtnActive : s.sendBtnDisabled),
          }}
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
        >
          전송
        </button>
      </div>
    </div>
  );
};

const s = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 520,
    fontSize: 13,
    border: '1px solid var(--border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    borderBottom: '1px solid var(--border)',
    background: 'rgba(0,0,0,0.02)',
    flexShrink: 0,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  botAvatar: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: 'var(--accent-bg, rgba(170,59,255,0.12))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
  },
  botName: { fontSize: 14, fontWeight: 700, color: 'var(--text-h)' },
  botStatus: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text)', marginTop: 2 },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#22c55e',
    display: 'inline-block',
  },
  headerRight: {},
  threadBadge: {
    fontSize: 10,
    color: 'var(--text)',
    fontFamily: 'var(--mono)',
    background: 'rgba(0,0,0,0.05)',
    padding: '3px 8px',
    borderRadius: 6,
  },
  messageArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  row: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'var(--accent-bg, rgba(170,59,255,0.12))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '72%',
    padding: '10px 14px',
    borderRadius: 16,
    fontSize: 13,
    lineHeight: 1.6,
    wordBreak: 'break-word',
  },
  bubbleUser: {
    background: 'var(--accent, #7c3aed)',
    color: '#fff',
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    background: 'rgba(0,0,0,0.04)',
    color: 'var(--text-h)',
    border: '1px solid var(--border)',
    borderBottomLeftRadius: 4,
  },
  bubbleError: {
    background: 'rgba(239,68,68,0.07)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#ef4444',
  },
  typingBubble: {
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  inputArea: {
    display: 'flex',
    gap: 10,
    padding: '12px 16px',
    borderTop: '1px solid var(--border)',
    background: 'rgba(0,0,0,0.02)',
    flexShrink: 0,
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    padding: '10px 14px',
    fontSize: 13,
    border: '1px solid var(--border)',
    borderRadius: 10,
    background: 'none',
    color: 'var(--text-h)',
    lineHeight: 1.5,
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  },
  sendBtn: {
    padding: '10px 18px',
    fontSize: 13,
    fontWeight: 700,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.15s',
    flexShrink: 0,
    height: 42,
  },
  sendBtnActive: {
    background: 'var(--accent, #7c3aed)',
    color: '#fff',
  },
  sendBtnDisabled: {
    background: 'rgba(0,0,0,0.06)',
    color: 'var(--text)',
    cursor: 'not-allowed',
    opacity: 0.5,
  },
};

export default ChatOrder;
