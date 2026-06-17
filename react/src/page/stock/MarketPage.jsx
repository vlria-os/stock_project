import { useState, useEffect, useRef } from "react";
import { getStocks } from "../../api/stockAPI";
import StockDetail from "./StockDetail";

const BASE_URL = import.meta.env.VITE_GATEWAY_URL;

export default function MarketPage({ onNavigate }) {
  const [allStocks, setAllStocks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [autoIdx, setAutoIdx] = useState(0);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [flashMap, setFlashMap] = useState({});
  const prevStocksRef = useRef({});

  // 뉴스 분석 상태
  const [newsReport, setNewsReport] = useState("");
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsStock, setNewsStock] = useState(null);

  // 주식 목록 30초마다 갱신
  useEffect(() => {
    const fetchStocks = () =>
        getStocks()
            .then((data) => {
              const list = Array.isArray(data) ? data : [];
              setAllStocks((prev) => {
                const flashes = {};
                list.forEach((s) => {
                  const old = prevStocksRef.current[s.code];
                  if (old && old !== s.currentPrice) {
                    flashes[s.code] = Number(s.currentPrice) > Number(old) ? "up" : "down";
                  }
                });
                if (Object.keys(flashes).length > 0) {
                  setFlashMap(flashes);
                  setTimeout(() => setFlashMap({}), 1000);
                }
                prevStocksRef.current = Object.fromEntries(list.map((s) => [s.code, s.currentPrice]));
                return list;
              });
            })
            .catch((e) => console.error("[주식 데이터 오류]", e));

    fetchStocks().finally(() => setLoading(false));
    const interval = setInterval(fetchStocks, 30000);
    return () => clearInterval(interval);
  }, []);

  // 선택 없을 때 9초마다 랜덤 순환
  useEffect(() => {
    if (selected !== null || allStocks.length === 0) return;
    const timer = setInterval(() => {
      setAutoIdx((prev) => {
        let next;
        do { next = Math.floor(Math.random() * allStocks.length); }
        while (next === prev && allStocks.length > 1);
        return next;
      });
    }, 9000);
    return () => clearInterval(timer);
  }, [selected, allStocks.length]);

  // 클릭 종목 우선, 없으면 자동 순환 종목
  const autoStock = allStocks[autoIdx];
  const displayStock = selected !== null
      ? selected
      : autoStock
          ? { code: autoStock.code, name: autoStock.name, market: autoStock.market }
          : null;

  // displayStock이 바뀔 때 뉴스 분석 자동 호출
  useEffect(() => {
    if (!displayStock) return;
    if (newsStock === displayStock.name) return;

    const fetchNews = async () => {
      setNewsLoading(true);
      setNewsReport("");
      setNewsStock(displayStock.name);
      try {
        const res = await fetch(`${BASE_URL}/api/ai/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stock: displayStock.name }),
        });
        const data = await res.json();
        setNewsReport(data.report || "분석 결과를 가져올 수 없습니다.");
      } catch (e) {
        setNewsReport("뉴스 분석 서버에 연결할 수 없습니다.");
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, [displayStock?.name]);

  // 같은 종목 다시 클릭하면 자동 순환으로 복귀
  const handleSelect = (item) => {
    setSelected((prev) =>
        prev?.code === item.code ? null : { code: item.code, name: item.name, market: item.market }
    );
  };

  const filtered = filter.trim()
      ? allStocks.filter((s) => s.name.includes(filter) || s.code.includes(filter))
      : allStocks;

  return (
      <div style={{ textAlign: "left" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={s.toolbar}>
          {selected === null && allStocks.length > 0 && (
              <span style={s.autoLabel}>⟳ 자동 순환 중</span>
          )}
          <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="종목명 또는 코드..."
              style={s.filterInput}
          />
        </div>

        <div style={s.layout}>
          {/* 왼쪽: 종목 리스트 */}
          <div style={s.listPanel}>
            {loading ? (
                <div style={s.msg}>불러오는 중...</div>
            ) : filtered.length === 0 ? (
                <div style={s.msg}>종목이 없습니다</div>
            ) : (
                filtered.map((item) => {
                  const change = Number(item.currentPrice) - Number(item.prevPrice);
                  const rate = Number(item.prevPrice) ? (change / Number(item.prevPrice)) * 100 : 0;
                  const clr = change > 0 ? "#ef4444" : change < 0 ? "#3b82f6" : "var(--text)";
                  const isSelected = selected?.code === item.code;
                  const isAuto = selected === null && displayStock?.code === item.code;
                  const flash = flashMap[item.code];
                  const flashStyle = flash === "up" ? s.flashUp : flash === "down" ? s.flashDown : {};
                  return (
                      <button
                          key={item.code}
                          onClick={() => handleSelect(item)}
                          style={{
                            ...s.row,
                            ...(isSelected ? s.rowSelected : isAuto ? s.rowAuto : {}),
                            ...flashStyle,
                          }}
                      >
                        <div style={{ flex: 1, textAlign: "left" }}>
                          <div style={s.stockName}>{item.name}</div>
                          <div style={s.stockMeta}>{item.code} · {item.market}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={s.stockPrice}>₩{Number(item.currentPrice).toLocaleString()}</div>
                          <div style={{ fontSize: 12, color: clr }}>
                            {change >= 0 ? "+" : ""}{change.toLocaleString(undefined, { maximumFractionDigits: 0 })}{" "}
                            ({rate >= 0 ? "+" : ""}{rate.toFixed(2)}%)
                          </div>
                        </div>
                      </button>
                  );
                })
            )}
          </div>

          {/* 가운데: 종목 상세 */}
          <div style={s.detailPanel}>
            <StockDetail stock={displayStock} onNavigate={onNavigate} />
          </div>

          {/* 오른쪽: 뉴스 분석 */}
          <div style={s.newsPanel}>
            <div style={s.newsHeader}>
              <span style={s.newsTitle}>📰 AI 뉴스 분석</span>
              {displayStock && (
                  <span style={s.newsStockBadge}>{displayStock.name}</span>
              )}
            </div>
            <div style={s.newsBody}>
              {!displayStock ? (
                  <div style={s.newsEmpty}>종목을 선택하면<br />뉴스 분석이 표시됩니다</div>
              ) : newsLoading ? (
                  <div style={s.newsLoadingWrap}>
                    <div style={s.spinner} />
                    <div style={s.newsLoadingText}>뉴스 분석 중...</div>
                  </div>
              ) : newsReport ? (
                  <pre style={s.newsContent}>{newsReport}</pre>
              ) : null}
            </div>
          </div>
        </div>
      </div>
  );
}

const s = {
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  autoLabel: {
    fontSize: 12,
    color: "var(--accent)",
    fontWeight: 500,
  },
  filterInput: {
    padding: "7px 12px",
    border: "1px solid var(--border)",
    borderRadius: 8,
    fontSize: 13,
    color: "var(--text-h)",
    background: "var(--bg)",
    outline: "none",
    width: 200,
    boxSizing: "border-box",
  },
  layout: {
    display: "flex",
    border: "1px solid var(--border)",
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 520,
  },
  listPanel: {
    width: "28%",
    borderRight: "1px solid var(--border)",
    overflowY: "auto",
    maxHeight: 580,
  },
  detailPanel: {
    width: "36%",
    borderRight: "1px solid var(--border)",
    padding: "20px",
    overflowY: "auto",
    maxHeight: 580,
  },
  newsPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    maxHeight: 580,
    overflowY: "auto",
  },
  newsHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "14px 16px",
    borderBottom: "1px solid var(--border)",
    position: "sticky",
    top: 0,
    background: "var(--bg)",
    zIndex: 1,
  },
  newsTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-h)",
  },
  newsStockBadge: {
    fontSize: 11,
    padding: "2px 8px",
    borderRadius: 99,
    background: "var(--accent-bg, rgba(170,59,255,0.12))",
    color: "var(--accent)",
    fontWeight: 500,
  },
  newsBody: {
    flex: 1,
    padding: "16px",
  },
  newsEmpty: {
    textAlign: "center",
    color: "var(--text)",
    fontSize: 13,
    marginTop: 60,
    lineHeight: 1.8,
  },
  newsLoadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    marginTop: 60,
  },
  spinner: {
    width: 24,
    height: 24,
    border: "2px solid var(--border)",
    borderTop: "2px solid var(--accent)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  newsLoadingText: {
    fontSize: 13,
    color: "var(--text)",
  },
  newsContent: {
    fontSize: 12,
    lineHeight: 1.8,
    color: "var(--text-h)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    margin: 0,
    fontFamily: "inherit",
  },
  msg: { padding: "48px 0", textAlign: "center", color: "var(--text)", fontSize: 14 },
  row: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "11px 14px",
    background: "none",
    border: "none",
    borderBottom: "1px solid var(--border)",
    cursor: "pointer",
    boxSizing: "border-box",
    gap: 8,
  },
  rowSelected: { background: "var(--accent-bg, rgba(170,59,255,0.12))" },
  rowAuto: { background: "rgba(0,0,0,0.03)" },
  stockName: { fontSize: 14, fontWeight: 600, color: "var(--text-h)", marginBottom: 2, textAlign: "left" },
  stockMeta: { fontSize: 12, color: "var(--text)", textAlign: "left" },
  stockPrice: { fontSize: 14, fontWeight: 600, color: "var(--text-h)", marginBottom: 2 },
  flashUp: { backgroundColor: "rgba(239,68,68,0.15)", transition: "background-color 0.1s" },
  flashDown: { backgroundColor: "rgba(59,130,246,0.15)", transition: "background-color 0.1s" },
};