import { useAuth } from "../../store/AuthContext";

export default function DashboardPage({ onNavigate }) {
  const { isAuthenticated } = useAuth();

  return (
    <div style={s.page}>

      {/* 상단 요약 카드 */}
      <div style={s.cardRow}>
        <div style={s.card}>
          <div style={s.cardLabel}>총 평가금액</div>
          {isAuthenticated
            ? <><div style={s.cardValue}>-</div><div style={s.cardSub}>보유 종목 -개</div></>
            : <button onClick={() => onNavigate("login")} style={s.loginPrompt}>로그인 후 확인</button>
          }
        </div>
        <div style={s.card}>
          <div style={s.cardLabel}>오늘 수익</div>
          {isAuthenticated
            ? <><div style={s.cardValue}>-</div><div style={s.cardSub}>수익률 -%</div></>
            : <button onClick={() => onNavigate("login")} style={s.loginPrompt}>로그인 후 확인</button>
          }
        </div>
        <div style={s.card}>
          <div style={s.cardLabel}>보유 현금</div>
          {isAuthenticated
            ? <><div style={s.cardValue}>-</div><div style={s.cardSub}>출금 가능금액</div></>
            : <button onClick={() => onNavigate("login")} style={s.loginPrompt}>로그인 후 확인</button>
          }
        </div>
        <div style={{ ...s.card, ...s.cardAccent }} onClick={() => onNavigate("ai")}>
          <div style={s.cardLabel}>AI 투자 어시스턴트</div>
          <div style={{ fontSize: 28, margin: "6px 0" }}>🤖</div>
          <div style={s.cardSub}>질문하러 가기 →</div>
        </div>
      </div>

      {/* 중단: 시장 지수 + 관심종목 */}
      <div style={s.midRow}>

        {/* 시장 지수 */}
        <div style={s.panel}>
          <div style={s.panelTitle}>📈 시장 지수</div>
          <div style={s.indexRow}>
            <div style={s.indexItem}>
              <div style={s.indexName}>KOSPI</div>
              <div style={s.indexValue}>-</div>
              <div style={s.indexChange}>-</div>
            </div>
            <div style={s.indexDivider} />
            <div style={s.indexItem}>
              <div style={s.indexName}>KOSDAQ</div>
              <div style={s.indexValue}>-</div>
              <div style={s.indexChange}>-</div>
            </div>
          </div>
        </div>

        {/* 관심종목 */}
        <div style={{ ...s.panel, flex: 2 }}>
          <div style={s.panelHeader}>
            <div style={s.panelTitle}>★ 관심종목</div>
            <button onClick={() => onNavigate("mypage")} style={s.moreBtn}>전체보기 →</button>
          </div>
          <div style={s.emptyBox}>로그인 후 관심종목이 표시됩니다</div>
        </div>

      </div>

      {/* 하단: 최근 주문 + 뉴스 */}
      <div style={s.midRow}>

        {/* 최근 주문 내역 */}
        <div style={s.panel}>
          <div style={s.panelHeader}>
            <div style={s.panelTitle}>📋 최근 주문</div>
            <button onClick={() => onNavigate("orders")} style={s.moreBtn}>전체보기 →</button>
          </div>
          <div style={s.emptyBox}>최근 주문 내역이 없습니다</div>
        </div>

        {/* 뉴스 */}
        <div style={{ ...s.panel, flex: 2 }}>
          <div style={s.panelHeader}>
            <div style={s.panelTitle}>📰 주요 뉴스</div>
            <button onClick={() => onNavigate("news")} style={s.moreBtn}>전체보기 →</button>
          </div>
          <div style={s.emptyBox}>뉴스를 불러오는 중...</div>
        </div>

      </div>

    </div>
  );
}

const s = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  // 상단 카드 행
  cardRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 14,
  },
  card: {
    padding: "18px 20px",
    border: "1px solid var(--border)",
    borderRadius: 12,
    background: "var(--bg)",
  },
  cardAccent: {
    border: "1px solid var(--accent)",
    background: "var(--accent-bg, rgba(170,59,255,0.06))",
    cursor: "pointer",
  },
  cardLabel: { fontSize: 12, color: "var(--text)", marginBottom: 6 },
  cardValue: { fontSize: 22, fontWeight: 700, color: "var(--text-h)" },
  cardSub: { fontSize: 12, color: "var(--text)", marginTop: 4 },
  // 중단/하단 행
  midRow: {
    display: "flex",
    gap: 14,
  },
  panel: {
    flex: 1,
    padding: "18px 20px",
    border: "1px solid var(--border)",
    borderRadius: 12,
    background: "var(--bg)",
    minHeight: 160,
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--text-h)",
    marginBottom: 14,
  },
  moreBtn: {
    background: "none",
    border: "none",
    color: "var(--accent)",
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 500,
    marginBottom: 14,
  },
  emptyBox: {
    padding: "24px 0",
    textAlign: "center",
    color: "var(--text)",
    fontSize: 13,
  },
  // 시장 지수
  indexRow: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    marginTop: 4,
  },
  indexItem: { flex: 1 },
  indexName: { fontSize: 12, color: "var(--text)", marginBottom: 4 },
  indexValue: { fontSize: 20, fontWeight: 700, color: "var(--text-h)" },
  indexChange: { fontSize: 12, color: "var(--text)", marginTop: 3 },
  indexDivider: {
    width: 1,
    height: 40,
    background: "var(--border)",
  },
  loginPrompt: {
    marginTop: 8,
    background: "none",
    border: "1px solid var(--border)",
    borderRadius: 6,
    padding: "5px 12px",
    fontSize: 12,
    color: "var(--text)",
    cursor: "pointer",
  },
};
