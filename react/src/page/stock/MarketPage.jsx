import { useState, useEffect, useRef } from "react";
import { getStocks } from "../../api/stockAPI";
import StockDetail from "./StockDetail";

export default function MarketPage({ onNavigate }) {
  const [allStocks, setAllStocks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [flashMap, setFlashMap] = useState({});
  const prevStocksRef = useRef({});

  useEffect(() => {
    const fetchStocks = () =>
      getStocks()
        .then((data) => {
          console.log(`[${new Date().toLocaleTimeString()}] 주식 데이터 수신 (${data.length}개)`);
          setAllStocks((prev) => {
            const flashes = {};
            const changed = [];
            data.forEach((s) => {
              const old = prevStocksRef.current[s.code];
              if (old && old !== s.currentPrice) {
                flashes[s.code] = Number(s.currentPrice) > Number(old) ? "up" : "down";
                changed.push(`${s.name}: ${Number(old).toLocaleString()} → ${Number(s.currentPrice).toLocaleString()} (${flashes[s.code] === "up" ? "▲" : "▼"})`);
              }
            });
            if (changed.length > 0) {
              console.log("[가격 변동]", changed.join(" | "));
            } else {
              console.log("[가격 변동] 없음");
            }
            if (Object.keys(flashes).length > 0) {
              setFlashMap(flashes);
              setTimeout(() => setFlashMap({}), 1000);
            }
            prevStocksRef.current = Object.fromEntries(data.map((s) => [s.code, s.currentPrice]));
            return data;
          });
        })
        .catch((e) => console.error("[주식 데이터 오류]", e));

    fetchStocks().finally(() => setLoading(false));
    const interval = setInterval(fetchStocks, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter.trim()
    ? allStocks.filter((s) => s.name.includes(filter) || s.code.includes(filter))
    : allStocks;

  return (
    <div style={{ textAlign: "left" }}>
      <div style={s.toolbar}>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="종목명 또는 코드..."
          style={s.filterInput}
        />
      </div>

      <div style={s.layout}>
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
              const active = selected?.code === item.code;
              const flash = flashMap[item.code];
              const flashStyle = flash === "up" ? s.flashUp : flash === "down" ? s.flashDown : {};
              return (
                <button
                  key={item.code}
                  onClick={() => setSelected({ code: item.code, name: item.name, market: item.market })}
                  style={{ ...s.row, ...(active ? s.rowActive : {}), ...flashStyle }}
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
        <div style={s.detailPanel}>
          <StockDetail stock={selected} onNavigate={onNavigate}/>
        </div>
      </div>
    </div>
  );
}

const s = {
  toolbar: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: 14,
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
    width: "42%",
    borderRight: "1px solid var(--border)",
    overflowY: "auto",
    maxHeight: 580,
  },
  detailPanel: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    maxHeight: 580,
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
  rowActive: { background: "var(--accent-bg, rgba(170,59,255,0.08))" },
  stockName: { fontSize: 14, fontWeight: 600, color: "var(--text-h)", marginBottom: 2, textAlign: "left" },
  stockMeta: { fontSize: 12, color: "var(--text)", textAlign: "left" },
  stockPrice: { fontSize: 14, fontWeight: 600, color: "var(--text-h)", marginBottom: 2 },
  flashUp: { backgroundColor: "rgba(239,68,68,0.15)", transition: "background-color 0.1s" },
  flashDown: { backgroundColor: "rgba(59,130,246,0.15)", transition: "background-color 0.1s" },
};
