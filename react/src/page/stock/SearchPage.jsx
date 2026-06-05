import { useState, useEffect } from "react";
import { getStocks } from "../../api/stockAPI";
import StockDetail from "./StockDetail";

export default function SearchPage({ onNavigate }) {
  const [allStocks, setAllStocks] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getStocks().then(setAllStocks).catch(() => {});
  }, []);

  const results = query.trim()
    ? allStocks.filter((s) => s.name.includes(query) || s.code.includes(query))
    : allStocks;

  return (
    <div style={{ textAlign: "left" }}>
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="종목명 또는 종목코드로 검색... (예: 삼성전자, 005930)"
        style={s.searchBar}
      />

      <div style={s.layout}>
        <div style={s.listPanel}>
          {results.length === 0 ? (
            <div style={s.empty}>검색 결과가 없습니다</div>
          ) : (
            results.map((item) => {
              const change = Number(item.currentPrice) - Number(item.prevPrice);
              const rate = Number(item.prevPrice) ? (change / Number(item.prevPrice)) * 100 : 0;
              const clr = change > 0 ? "#ef4444" : change < 0 ? "#3b82f6" : "var(--text)";
              const active = selected?.code === item.code;
              return (
                <button
                  key={item.code}
                  onClick={() => setSelected({ code: item.code, name: item.name, market: item.market })}
                  style={{ ...s.row, ...(active ? s.rowActive : {}) }}
                >
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={s.name}>{item.name}</div>
                    <div style={s.meta}>{item.code} · {item.market}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={s.price}>₩{Number(item.currentPrice).toLocaleString()}</div>
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
  searchBar: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 16px",
    border: "1px solid var(--border)",
    borderRadius: 10,
    fontSize: 15,
    color: "var(--text-h)",
    background: "var(--bg)",
    outline: "none",
    marginBottom: 14,
  },
  layout: {
    display: "flex",
    border: "1px solid var(--border)",
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 500,
  },
  listPanel: {
    width: "42%",
    borderRight: "1px solid var(--border)",
    overflowY: "auto",
    maxHeight: 560,
  },
  detailPanel: {
    flex: 1,
    padding: "20px 20px",
    overflowY: "auto",
    maxHeight: 560,
  },
  empty: {
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
  name: { fontSize: 14, fontWeight: 600, color: "var(--text-h)", marginBottom: 2 },
  meta: { fontSize: 12, color: "var(--text)" },
  price: { fontSize: 14, fontWeight: 600, color: "var(--text-h)", marginBottom: 2 },
};
