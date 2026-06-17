import { useEffect, useState } from "react";
import { useAuth } from "../../store/AuthContext";
import { getWishlist, getIndex, getMainNews } from "../../api/stockAPI";
import { holdings as fetchHoldings, orders as fetchOrders } from "../../api/tradeAPI";

const fetchBalance = (token) =>
  fetch(`${import.meta.env.VITE_GATEWAY_URL}/api/balance`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  }).then((r) => (r.ok ? r.json() : null));

export default function DashboardPage({ onNavigate }) {
  const { isAuthenticated, accessToken } = useAuth();
  const [balance, setBalance] = useState(null);
  const [holdingCount, setHoldingCount] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [kospi, setKospi] = useState(null);
  const [kosdaq, setKosdaq] = useState(null);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  // 시장 지수 + 뉴스는 로그인 여부와 무관하게 로드
  useEffect(() => {
    Promise.allSettled([getIndex("0001"), getIndex("1001")]).then(([kp, kq]) => {
      if (kp.status === "fulfilled") setKospi(kp.value);
      if (kq.status === "fulfilled") setKosdaq(kq.value);
    });
    getMainNews()
      .then((data) => setNews(data || []))
      .catch(() => setNews([]))
      .finally(() => setNewsLoading(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingData(true);
    Promise.allSettled([
      fetchBalance(accessToken),
      fetchHoldings(0),
      getWishlist(accessToken),
      fetchOrders(null, 0, "desc", null),
    ]).then(([balR, holdR, wishR, orderR]) => {
      if (balR.status === "fulfilled") setBalance(balR.value);
      if (holdR.status === "fulfilled") {
        const d = holdR.value;
        setHoldingCount(d?.totalElements ?? d?.content?.length ?? 0);
      }
      if (wishR.status === "fulfilled") setWishlist(wishR.value?.slice(0, 5) || []);
      if (orderR.status === "fulfilled") setRecentOrders(orderR.value?.content?.slice(0, 3) || []);
      setLoadingData(false);
    });
  }, [isAuthenticated, accessToken]);

  const fmt = (n) => (n != null ? Number(n).toLocaleString() + "원" : "-");

  return (
    <div style={s.page}>

      {/* 상단 요약 카드 */}
      <div style={s.cardRow}>
        <div style={s.card}>
          <div style={s.cardLabel}>보유 현금</div>
          {isAuthenticated
            ? <>
                <div style={s.cardValue}>{loadingData ? "..." : fmt(balance)}</div>
                <div style={s.cardSub}>증권계좌 잔액</div>
              </>
            : <button onClick={() => onNavigate("login")} style={s.loginPrompt}>로그인 후 확인</button>
          }
        </div>
        <div style={s.card}>
          <div style={s.cardLabel}>보유 종목</div>
          {isAuthenticated
            ? <>
                <div style={s.cardValue}>{loadingData ? "..." : holdingCount != null ? `${holdingCount}개` : "-"}</div>
                <button onClick={() => onNavigate("holdings")} style={s.cardLink}>전체보기 →</button>
              </>
            : <button onClick={() => onNavigate("login")} style={s.loginPrompt}>로그인 후 확인</button>
          }
        </div>
        <div style={s.card}>
          <div style={s.cardLabel}>관심종목</div>
          {isAuthenticated
            ? <>
                <div style={s.cardValue}>{loadingData ? "..." : `${wishlist.length}개`}</div>
                <button onClick={() => onNavigate("mypage")} style={s.cardLink}>마이페이지 →</button>
              </>
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
            <IndexItem label="KOSPI" data={kospi} />
            <div style={s.indexDivider} />
            <IndexItem label="KOSDAQ" data={kosdaq} />
          </div>
        </div>

        {/* 관심종목 */}
        <div style={{ ...s.panel, flex: 2 }}>
          <div style={s.panelHeader}>
            <div style={s.panelTitle}>★ 관심종목</div>
            <button onClick={() => onNavigate("mypage")} style={s.moreBtn}>전체보기 →</button>
          </div>
          {!isAuthenticated
            ? <div style={s.emptyBox}>로그인 후 관심종목이 표시됩니다</div>
            : loadingData
            ? <div style={s.emptyBox}>불러오는 중...</div>
            : wishlist.length === 0
            ? <div style={s.emptyBox}>관심종목이 없습니다</div>
            : wishlist.map((item) => {
                const change = Number(item.currentPrice) - Number(item.prevPrice);
                const rate = Number(item.prevPrice) ? (change / Number(item.prevPrice)) * 100 : 0;
                const clr = change > 0 ? "#ef4444" : change < 0 ? "#3b82f6" : "var(--text)";
                return (
                  <div key={item.stockCode} style={s.wishRow}
                    onClick={() => onNavigate("market")}>
                    <div style={{ flex: 1 }}>
                      <div style={s.rowName}>{item.stockName}</div>
                      <div style={s.rowMeta}>{item.stockCode}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={s.rowPrice}>₩{Number(item.currentPrice).toLocaleString()}</div>
                      <div style={{ fontSize: 12, color: clr }}>
                        {change >= 0 ? "+" : ""}{change.toLocaleString(undefined, { maximumFractionDigits: 0 })}{" "}
                        ({rate >= 0 ? "+" : ""}{rate.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                );
              })
          }
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
          {!isAuthenticated
            ? <div style={s.emptyBox}>로그인 후 확인 가능합니다</div>
            : loadingData
            ? <div style={s.emptyBox}>불러오는 중...</div>
            : recentOrders.length === 0
            ? <div style={s.emptyBox}>최근 주문 내역이 없습니다</div>
            : recentOrders.map((o, i) => (
                <div key={o.orderId ?? i} style={s.orderRow}>
                  <div style={{ flex: 1 }}>
                    <div style={s.rowName}>{o.stockCode}</div>
                    <div style={s.rowMeta}>{o.orderType === "BUY" ? "매수" : "매도"} · {o.quantity}주</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={s.rowPrice}>₩{Number(o.price).toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: o.status === "FILLED" ? "#16a34a" : "var(--text)" }}>
                      {o.status === "FILLED" ? "체결" : o.status === "PENDING" ? "대기" : o.status}
                    </div>
                  </div>
                </div>
              ))
          }
        </div>

        {/* 뉴스 */}
        <div style={{ ...s.panel, flex: 2 }}>
          <div style={s.panelHeader}>
            <div style={s.panelTitle}>📰 주요 뉴스</div>
            <a href="https://www.hankyung.com/finance" target="_blank" rel="noopener noreferrer" style={s.moreBtn}>전체보기 →</a>
          </div>
          {newsLoading
            ? <div style={s.emptyBox}>뉴스를 불러오는 중...</div>
            : news.length === 0
            ? <div style={s.emptyBox}>뉴스를 불러올 수 없습니다</div>
            : news.map((item, i) => (
                <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" style={s.newsRow}>
                  <div style={s.newsTitle}>{item.title}</div>
                  <div style={s.newsMeta}>{item.pubDate?.slice(0, 16) || ""}</div>
                </a>
              ))
          }
        </div>

      </div>

    </div>
  );
}

function IndexItem({ label, data }) {
  const val = data?.bstp_nmix_prpr;
  const diff = data?.bstp_nmix_prdy_vrss;
  const rate = data?.bstp_nmix_prdy_ctrt;
  const isUp = diff != null && parseFloat(diff) > 0;
  const isDown = diff != null && parseFloat(diff) < 0;
  const clr = isUp ? "#ef4444" : isDown ? "#3b82f6" : "var(--text)";
  return (
    <div style={s.indexItem}>
      <div style={s.indexName}>{label}</div>
      <div style={s.indexValue}>{val ? parseFloat(val).toLocaleString() : "-"}</div>
      {diff != null && (
        <div style={{ fontSize: 12, color: clr, marginTop: 3 }}>
          {parseFloat(diff) >= 0 ? "+" : ""}{parseFloat(diff).toLocaleString()} ({parseFloat(rate) >= 0 ? "+" : ""}{rate}%)
        </div>
      )}
    </div>
  );
}

const s = {
  page: { display: "flex", flexDirection: "column", gap: 16 },
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
  cardLink: {
    marginTop: 4,
    background: "none",
    border: "none",
    color: "var(--accent)",
    fontSize: 12,
    cursor: "pointer",
    padding: 0,
    fontWeight: 500,
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
  midRow: { display: "flex", gap: 14 },
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
    marginBottom: 10,
  },
  panelTitle: { fontSize: 14, fontWeight: 600, color: "var(--text-h)" },
  moreBtn: {
    background: "none",
    border: "none",
    color: "var(--accent)",
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 500,
  },
  emptyBox: {
    padding: "24px 0",
    textAlign: "center",
    color: "var(--text)",
    fontSize: 13,
  },
  indexRow: { display: "flex", alignItems: "center", gap: 20, marginTop: 10 },
  indexItem: { flex: 1 },
  indexName: { fontSize: 12, color: "var(--text)", marginBottom: 4 },
  indexValue: { fontSize: 20, fontWeight: 700, color: "var(--text-h)" },
  indexChange: { fontSize: 12, color: "var(--text)", marginTop: 3 },
  indexDivider: { width: 1, height: 40, background: "var(--border)" },
  wishRow: {
    display: "flex",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid var(--border)",
    cursor: "pointer",
    gap: 8,
  },
  orderRow: {
    display: "flex",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid var(--border)",
    gap: 8,
  },
  rowName: { fontSize: 13, fontWeight: 600, color: "var(--text-h)" },
  rowMeta: { fontSize: 12, color: "var(--text)", marginTop: 2 },
  rowPrice: { fontSize: 13, fontWeight: 600, color: "var(--text-h)" },
  newsRow: {
    display: "block",
    padding: "8px 0",
    borderBottom: "1px solid var(--border)",
    textDecoration: "none",
    cursor: "pointer",
  },
  newsTitle: { fontSize: 13, fontWeight: 500, color: "var(--text-h)", lineHeight: 1.4 },
  newsMeta: { fontSize: 11, color: "var(--text)", marginTop: 3 },
};
