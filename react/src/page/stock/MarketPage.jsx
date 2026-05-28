import { useState, useEffect } from "react";
import { getStocks, getWishlist } from "../../api/stockAPI";
import { useAuth } from "../../store/AuthContext";
import StockDetail from "./StockDetail";

export default function MarketPage() {
  const { accessToken, isAuthenticated } = useAuth();
  const [tab, setTab] = useState("all");
  const [allStocks, setAllStocks] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [wishLoading, setWishLoading] = useState(false);

  useEffect(() => {
    getStocks()
      .then(setAllStocks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab !== "wish" || !isAuthenticated) return;
    setWishLoading(true);
    getWishlist(accessToken)
      .then(setWishlist)
      .catch(() => {})
      .finally(() => setWishLoading(false));
  }, [tab, isAuthenticated]);

  // normalize wishlist item to same shape as stock list item
  const toStock = (item) =>
    tab === "all"
      ? { code: item.code, name: item.name, market: item.market, currentPrice: item.currentPrice, prevPrice: item.prevPrice }
      : { code: item.stockCode, name: item.stockName, market: item.market, currentPrice: item.currentPrice, prevPrice: item.prevPrice };

  const source = tab === "all" ? allStocks : wishlist;
  const filtered = filter.trim()
    ? source.filter((s) => {
        const name = tab === "all" ? s.name : s.stockName;
        const code = tab === "all" ? s.code : s.stockCode;
        return name?.includes(filter) || code?.includes(filter);
      })
    : source;

  const isListLoading = tab === "all" ? loading : wishLoading;

  return (
    <div style={{ textAlign: "left" }}>
      <div style={s.toolbar}>
        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(tab === "all" ? s.tabActive : {}) }} onClick={() => setTab("all")}>
            전체종목
          </button>
          <button
            style={{ ...s.tab, ...(tab === "wish" ? s.tabActive : {}), ...(!isAuthenticated ? s.tabDisabled : {}) }}
            onClick={() => isAuthenticated && setTab("wish")}
            title={!isAuthenticated ? "로그인이 필요합니다" : ""}
          >
            ★ 관심종목
          </button>
        </div>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="종목명 또는 코드..."
          style={s.filterInput}
        />
      </div>

      <div style={s.layout}>
        <div style={s.listPanel}>
          {isListLoading ? (
            <div style={s.msg}>불러오는 중...</div>
          ) : !isAuthenticated && tab === "wish" ? (
            <div style={s.msg}>로그인이 필요합니다</div>
          ) : filtered.length === 0 ? (
            <div style={s.msg}>종목이 없습니다</div>
          ) : (
            filtered.map((item) => {
              const st = toStock(item);
              const change = Number(st.currentPrice) - Number(st.prevPrice);
              const rate = Number(st.prevPrice) ? (change / Number(st.prevPrice)) * 100 : 0;
              const isUp = change > 0;
              const isDown = change < 0;
              const clr = isUp ? "#ef4444" : isDown ? "#3b82f6" : "var(--text)";
              const active = selected?.code === st.code;
              return (
                <button key={st.code} onClick={() => setSelected(st)} style={{ ...s.row, ...(active ? s.rowActive : {}) }}>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={s.stockName}>{st.name}</div>
                    <div style={s.stockMeta}>{st.code} · {st.market}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={s.stockPrice}>₩{Number(st.currentPrice).toLocaleString()}</div>
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
        <div style={s.detailPanel}>
          <StockDetail stock={selected} />
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
    gap: 12,
  },
  tabs: {
    display: "flex",
    gap: 3,
    background: "var(--code-bg, #f4f3ec)",
    borderRadius: 8,
    padding: 3,
  },
  tab: {
    background: "none",
    border: "none",
    padding: "6px 14px",
    borderRadius: 6,
    fontSize: 14,
    cursor: "pointer",
    color: "var(--text)",
    fontWeight: 500,
  },
  tabActive: {
    background: "var(--bg)",
    color: "var(--text-h)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  tabDisabled: { opacity: 0.4, cursor: "not-allowed" },
  filterInput: {
    padding: "7px 12px",
    border: "1px solid var(--border)",
    borderRadius: 8,
    fontSize: 13,
    color: "var(--text-h)",
    background: "var(--bg)",
    outline: "none",
    width: 180,
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
    width: "42%",
    borderRight: "1px solid var(--border)",
    overflowY: "auto",
    maxHeight: 580,
  },
  detailPanel: {
    flex: 1,
    padding: "20px 20px",
    overflowY: "auto",
    maxHeight: 580,
  },
  msg: {
    padding: "48px 0",
    textAlign: "center",
    color: "var(--text)",
    fontSize: 14,
  },
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
  rowActive: { background: "var(--accent-bg, rgba(170,59,255,0.08))" },
  stockName: { fontSize: 14, fontWeight: 600, color: "var(--text-h)", marginBottom: 2, textAlign: "left" },
  stockMeta: { fontSize: 12, color: "var(--text)", textAlign: "left" },
  stockPrice: { fontSize: 14, fontWeight: 600, color: "var(--text-h)", marginBottom: 2 },
};
