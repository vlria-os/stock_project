import { useState, useEffect } from "react";

const API = "http://52.95.252.64:8080/api/balance";

async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });
    if (!res.ok) throw new Error(await res.text());
    const ct = res.headers.get("content-type");
    return ct?.includes("json") ? res.json() : null;
}

const TYPE_LABEL = {
    DEPOSIT:      { text: "입금",    color: "#16a34a", bg: "#dcfce7" },
    WITHDRAW:     { text: "출금",    color: "#dc2626", bg: "#fee2e2" },
    LOCK:         { text: "주문잠금", color: "#d97706", bg: "#fef3c7" },
    UNLOCK:       { text: "잠금해제", color: "#2563eb", bg: "#dbeafe" },
    BUY_CONFIRM:  { text: "매수체결", color: "#dc2626", bg: "#fee2e2" },
    SELL_CONFIRM: { text: "매도체결", color: "#16a34a", bg: "#dcfce7" },
    BUY_FAIL:     { text: "매수실패", color: "#9ca3af", bg: "#f3f4f6" },
    SELL_FAIL:    { text: "매도실패", color: "#9ca3af", bg: "#f3f4f6" },
};

export default function Balance() {
    const [balance, setBalance]   = useState(null);
    const [history, setHistory]   = useState([]);
    const [amount, setAmount]     = useState("");
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState("");

    const fetchAll = async () => {
        try {
            const [bal, hist] = await Promise.all([
                apiFetch(""),
                apiFetch("/history"),
            ]);
            setBalance(bal);
            setHistory(hist);
        } catch (e) {
            setError("데이터 조회 실패");
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleAction = async (type) => {
        const n = parseInt(amount);
        if (!n || n <= 0) return;
        if (type === "withdraw" && n > balance) {
            setError("잔액이 부족합니다");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await apiFetch(`/${type}`, {
                method: "POST",
                body: JSON.stringify({
                    amount: n,
                    idempotencyKey: Date.now(),
                }),
            });
            await fetchAll();
            setAmount("");
        } catch (e) {
            setError(e.message || "요청 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 480, margin: "0 auto" }}>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.card}>
                <p style={styles.label}>증권계좌 잔액</p>
                <p style={styles.balance}>
                    {balance === null ? "불러오는 중..." : `${balance.toLocaleString()}원`}
                </p>
            </div>

            <div style={styles.card}>
                <input
                    type="number"
                    placeholder="금액 입력"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={styles.input}
                    disabled={loading}
                />
                <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleAction("deposit")} disabled={loading}
                            style={{ ...styles.btn, ...styles.btnDeposit }}>
                        {loading ? "처리 중..." : "입금"}
                    </button>
                    <button onClick={() => handleAction("withdraw")} disabled={loading}
                            style={{ ...styles.btn, ...styles.btnWithdraw }}>
                        {loading ? "처리 중..." : "출금"}
                    </button>
                </div>
            </div>

            <div style={styles.card}>
                <p style={styles.sectionTitle}>거래 내역</p>
                {history.length === 0 && (
                    <p style={{ fontSize: 14, color: "var(--color-text-tertiary, #aaa)" }}>내역 없음</p>
                )}
                {history.map((h) => {
                    const t = TYPE_LABEL[h.type] ?? { text: h.type, color: "#666", bg: "#f3f4f6" };
                    const signed = ["DEPOSIT", "SELL_CONFIRM", "UNLOCK"].includes(h.type) ? "+" : "-";
                    return (
                        <div key={h.historyId} style={styles.historyRow}>
                            <div>
                                <span style={{ ...styles.badge, background: t.bg, color: t.color }}>{t.text}</span>
                                <span style={{ fontSize: 13, color: "var(--color-text-tertiary, #aaa)", marginLeft: 8 }}>
                  {h.createAt?.slice(0, 10)}
                </span>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontWeight: 500, color: t.color }}>
                                    {signed}{h.amount.toLocaleString()}원
                                </div>
                                <div style={{ fontSize: 12, color: "var(--color-text-tertiary, #aaa)" }}>
                                    잔액 {h.balanceAfter.toLocaleString()}원
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}

const styles = {
    card: {
        background: "var(--color-background-primary, #fff)",
        border: "1px solid var(--color-border-tertiary, #eee)",
        borderRadius: 12, padding: "20px 24px", marginBottom: 16,
    },
    error: {
        background: "#fee2e2", color: "#dc2626",
        borderRadius: 8, padding: "10px 14px", fontSize: 14, marginBottom: 12,
    },
    label: { fontSize: 13, color: "var(--color-text-secondary, #666)", marginBottom: 8 },
    balance: { fontSize: 32, fontWeight: 600, color: "var(--color-text-primary, #111)" },
    input: {
        width: "100%", marginBottom: 10, fontSize: 15,
        padding: "10px 12px", borderRadius: 8,
        border: "1px solid var(--color-border-tertiary, #ddd)", boxSizing: "border-box",
    },
    btn: { flex: 1, padding: "10px 0", fontSize: 15, fontWeight: 500, border: "none", borderRadius: 8, cursor: "pointer" },
    btnDeposit:  { background: "#16a34a", color: "#fff" },
    btnWithdraw: { background: "#dc2626", color: "#fff" },
    sectionTitle: { fontSize: 14, fontWeight: 500, marginBottom: 12, color: "var(--color-text-primary, #111)" },
    historyRow: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 0", borderTop: "1px solid var(--color-border-tertiary, #eee)",
    },
    badge: { fontSize: 12, padding: "2px 8px", borderRadius: 99, fontWeight: 500 },
};