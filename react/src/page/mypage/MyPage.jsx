import { useState, useEffect } from "react";
import { useAuth } from "../../store/AuthContext";
import { getMe, deleteMe } from "../../api/authAPI";
import { getWishlist, removeWishlist } from "../../api/stockAPI";
import StockDetail from "../stock/StockDetail";

export default function MyPage({ onNavigate }) {
  const { accessToken, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getMe(accessToken),
      getWishlist(accessToken),
    ]).then(([userR, wishR]) => {
      if (userR.status === "fulfilled") setUser(userR.value);
      if (wishR.status === "fulfilled") setWishlist(wishR.value || []);
      setLoading(false);
    });
  }, [accessToken]);

  const handleRemoveWish = async (code) => {
    try {
      await removeWishlist(code, accessToken);
      setWishlist((prev) => prev.filter((w) => w.stockCode !== code));
      if (selected?.code === code) setSelected(null);
    } catch (_) {}
  };

  const handleDeleteAccount = async () => {
    if (!confirm("정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    try {
      await deleteMe(accessToken);
      logout();
    } catch (_) {
      alert("회원탈퇴에 실패했습니다.");
    }
  };

  if (loading) return <div style={s.loadingPage}>불러오는 중...</div>;

  return (
    <div style={{ textAlign: "left" }}>
      {/* 유저 정보 */}
      <div style={s.userCard}>
        <div style={s.avatar}>👤</div>
        <div>
          <div style={s.userName}>{user?.name}</div>
          <div style={s.userEmail}>{user?.email}</div>
        </div>
      </div>

      <div style={s.layout}>
        {/* 관심종목 목록 */}
        <div style={s.wishPanel}>
          <div style={s.sectionTitle}>
            ★ 관심종목
            <span style={s.count}>{wishlist.length}</span>
          </div>
          {wishlist.length === 0 ? (
            <div style={s.empty}>
              <div>관심 종목이 없습니다</div>
              <button onClick={() => onNavigate("market")} style={s.goBtn}>
                종목 둘러보기 →
              </button>
            </div>
          ) : (
            wishlist.map((item) => {
              const change = Number(item.currentPrice) - Number(item.prevPrice);
              const rate = Number(item.prevPrice) ? (change / Number(item.prevPrice)) * 100 : 0;
              const clr = change > 0 ? "#ef4444" : change < 0 ? "#3b82f6" : "var(--text)";
              const active = selected?.code === item.stockCode;
              return (
                <div
                  key={item.stockCode}
                  style={{ ...s.wishRow, ...(active ? s.wishRowActive : {}) }}
                  onClick={() => setSelected({ code: item.stockCode, name: item.stockName, market: item.market })}
                >
                  <div style={{ flex: 1 }}>
                    <div style={s.stockName}>{item.stockName}</div>
                    <div style={s.stockMeta}>{item.stockCode} · {item.market}</div>
                  </div>
                  <div style={{ textAlign: "right", marginRight: 12 }}>
                    <div style={s.stockPrice}>₩{Number(item.currentPrice).toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: clr }}>
                      {change >= 0 ? "+" : ""}{change.toLocaleString(undefined, { maximumFractionDigits: 0 })}{" "}
                      ({rate >= 0 ? "+" : ""}{rate.toFixed(2)}%)
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveWish(item.stockCode); }}
                    style={s.removeBtn}
                    title="관심종목 삭제"
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* 종목 상세 */}
        <div style={s.detailPanel}>
          <StockDetail stock={selected} />
        </div>
      </div>

      {/* 회원탈퇴 */}
      <div style={s.dangerZone}>
        <button onClick={handleDeleteAccount} style={s.deleteBtn}>
          회원탈퇴
        </button>
      </div>
    </div>
  );
}

const s = {
  loadingPage: { padding: 60, textAlign: "center", color: "var(--text)" },
  userCard: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "20px 24px",
    border: "1px solid var(--border)",
    borderRadius: 12,
    marginBottom: 20,
  },
  avatar: { fontSize: 36 },
  userName: { fontSize: 18, fontWeight: 700, color: "var(--text-h)", marginBottom: 4 },
  userEmail: { fontSize: 14, color: "var(--text)" },
  layout: {
    display: "flex",
    border: "1px solid var(--border)",
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 420,
    marginBottom: 20,
  },
  wishPanel: {
    width: "42%",
    borderRight: "1px solid var(--border)",
    overflowY: "auto",
    maxHeight: 520,
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "14px 16px",
    fontWeight: 600,
    fontSize: 14,
    color: "var(--text-h)",
    borderBottom: "1px solid var(--border)",
  },
  count: {
    background: "var(--accent-bg, rgba(170,59,255,0.1))",
    color: "var(--accent)",
    fontSize: 12,
    fontWeight: 700,
    padding: "1px 7px",
    borderRadius: 10,
  },
  empty: {
    padding: "48px 0",
    textAlign: "center",
    color: "var(--text)",
    fontSize: 14,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  goBtn: {
    background: "none",
    border: "1px solid var(--accent)",
    color: "var(--accent)",
    padding: "6px 14px",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 600,
  },
  wishRow: {
    display: "flex",
    alignItems: "center",
    padding: "11px 14px",
    borderBottom: "1px solid var(--border)",
    cursor: "pointer",
  },
  wishRowActive: { background: "var(--accent-bg, rgba(170,59,255,0.08))" },
  stockName: { fontSize: 14, fontWeight: 600, color: "var(--text-h)", marginBottom: 2 },
  stockMeta: { fontSize: 12, color: "var(--text)" },
  stockPrice: { fontSize: 14, fontWeight: 600, color: "var(--text-h)", marginBottom: 2 },
  removeBtn: {
    flexShrink: 0,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text)",
    fontSize: 14,
    padding: "4px 6px",
    borderRadius: 4,
  },
  detailPanel: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    maxHeight: 520,
  },
  dangerZone: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: 8,
  },
  deleteBtn: {
    background: "none",
    border: "1px solid #ef4444",
    color: "#ef4444",
    padding: "6px 16px",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
  },
};
