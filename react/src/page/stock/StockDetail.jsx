import { useEffect, useState } from "react";
import { getPrice, getChart, checkWishlist, addWishlist, removeWishlist } from "../../api/stockAPI";
import { useAuth } from "../../store/AuthContext";
import MiniChart from "./MiniChart";

export default function StockDetail({ stock, onNavigate }) {
  const { accessToken, isAuthenticated } = useAuth();
  const [price, setPrice] = useState(null);
  const [chart, setChart] = useState([]);
  const [wished, setWished] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!stock) return;
    setLoading(true);
    setPrice(null);
    setChart([]);
    setWished(false);

    const calls = [getPrice(stock.code), getChart(stock.code)];
    if (isAuthenticated) calls.push(checkWishlist(stock.code, accessToken));

    Promise.allSettled(calls).then((results) => {
      if (results[0].status === "fulfilled") setPrice(results[0].value);
      if (results[1].status === "fulfilled") setChart(results[1].value || []);
      if (results[2]?.status === "fulfilled") setWished(results[2].value?.wishlisted || false);
      setLoading(false);
    });
  }, [stock?.code, isAuthenticated]);

  const toggleWish = async () => {
    if (!isAuthenticated || !stock) return;
    const prev = wished;
    setWished(!prev);
    try {
      if (prev) await removeWishlist(stock.code, accessToken);
      else await addWishlist(stock.code, accessToken);
    } catch (_) {
      setWished(prev);
    }
  };

  if (!stock) {
    return (
      <div style={s.empty}>
        <div style={{ fontSize: 40 }}>📊</div>
        <p style={{ marginTop: 12, color: "var(--text)", fontSize: 14 }}>
          종목을 선택하면 상세 정보가 표시됩니다
        </p>
      </div>
    );
  }

  const diff = price ? parseInt(price.prdy_vrss) : null;
  const rate = price ? parseFloat(price.prdy_ctrt) : null;
  const isUp = diff != null && diff > 0;
  const isDown = diff != null && diff < 0;
  const diffColor = isUp ? "#ef4444" : isDown ? "#3b82f6" : "var(--text)";
  const diffStr = diff != null
    ? `${diff >= 0 ? "+" : ""}${diff.toLocaleString()} (${rate >= 0 ? "+" : ""}${rate}%)`
    : "-";

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <span style={s.name}
            onClick={() => onNavigate?.("orderbook", { stockCode: stock.code })}>{stock.name}</span>
          <span style={s.code}>{stock.code}</span>
          <span style={{
            ...s.badge,
            background: stock.market === "KOSPI" ? "#ede9fe" : "#fce7f3",
            color: stock.market === "KOSPI" ? "#7c3aed" : "#be185d",
          }}>
            {stock.market}
          </span>
        </div>
        {isAuthenticated && (
          <button
            onClick={toggleWish}
            style={{ ...s.wishBtn, ...(wished ? s.wishBtnOn : {}) }}
          >
            {wished ? "★ 관심종목" : "☆ 관심추가"}
          </button>
        )}
      </div>

      {loading ? (
        <div style={s.loading}>불러오는 중...</div>
      ) : (
        <>
          {price && (
            <div style={s.priceBox}>
              <div style={s.priceMain}>
                ₩{parseInt(price.stck_prpr).toLocaleString()}
              </div>
              <div style={{ color: diffColor, fontSize: 15, fontWeight: 500, marginTop: 4 }}>
                {diffStr}
              </div>
              <div style={s.priceGrid}>
                <div style={s.priceCell}>
                  <span style={s.priceLabel}>고가</span>
                  <span style={{ color: "#ef4444", fontWeight: 600 }}>
                    ₩{parseInt(price.stck_hgpr).toLocaleString()}
                  </span>
                </div>
                <div style={s.priceCell}>
                  <span style={s.priceLabel}>저가</span>
                  <span style={{ color: "#3b82f6", fontWeight: 600 }}>
                    ₩{parseInt(price.stck_lwpr).toLocaleString()}
                  </span>
                </div>
                <div style={s.priceCell}>
                  <span style={s.priceLabel}>거래량</span>
                  <span style={{ fontWeight: 600 }}>
                    {parseInt(price.acml_vol).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
          {chart.length > 0 && <MiniChart data={chart} />}
          <button
            type="button"
            onClick={() => onNavigate?.("order", { stockCode: stock.code, stockName: stock.name })}
            style={s.orderBtn}
          >
            주문하기
          </button>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate("ai", { stockCode: stock.code, stockName: stock.name })}
              style={s.aiBtn}
            >
              🤖 AI에게 물어보기 →
            </button>
          )}
        </>
      )}
    </div>
  );
}

const s = {
  wrap: { height: "100%" },
  empty: {
    height: "100%",
    minHeight: 300,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottom: "1px solid var(--border)",
    gap: 8,
  },
  name: { fontSize: 18, fontWeight: 700, color: "var(--text-h)", marginRight: 8, cursor:"pointer" },
  code: { fontSize: 12, color: "var(--text)", marginRight: 8, fontFamily: "var(--mono)" },
  badge: { fontSize: 11, padding: "2px 6px", borderRadius: 4, fontWeight: 600 },
  wishBtn: {
    flexShrink: 0,
    background: "none",
    border: "1px solid var(--accent)",
    color: "var(--accent)",
    padding: "5px 12px",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  wishBtnOn: { background: "var(--accent)", color: "#fff" },
  loading: { padding: "40px 0", textAlign: "center", color: "var(--text)", fontSize: 14 },
  priceBox: { marginBottom: 20 },
  priceMain: { fontSize: 30, fontWeight: 700, color: "var(--text-h)" },
  priceGrid: {
    display: "flex",
    gap: 24,
    marginTop: 16,
    paddingTop: 16,
    borderTop: "1px solid var(--border)",
  },
  priceCell: { display: "flex", flexDirection: "column", gap: 4, fontSize: 14 },
  priceLabel: { fontSize: 11, color: "var(--text)" },
  orderBtn: {
    marginTop: 20,
    width: "100%",
    padding: "12px 0",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  aiBtn: {
    marginTop: 8,
    width: "100%",
    padding: "10px 0",
    background: "none",
    color: "var(--accent, #aa3bff)",
    border: "1px solid var(--accent, #aa3bff)",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};
