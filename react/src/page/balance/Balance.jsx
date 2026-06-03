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

const BANKS = ["카카오뱅크", "토스뱅크", "신한은행", "국민은행", "우리은행", "하나은행", "농협은행"];

export default function Balance() {
    const [balance, setBalance]           = useState(null);
    const [history, setHistory]           = useState([]);
    const [linkedAccounts, setLinked]     = useState([]);
    const [selectedAccountId, setSelected] = useState(null);
    const [amount, setAmount]             = useState("");
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState("");

    // 연결 계좌 추가 폼
    const [showAddForm, setShowAddForm]   = useState(false);
    const [newBank, setNewBank]           = useState(BANKS[0]);
    const [newAccountNo, setNewAccountNo] = useState("");

    const fetchAll = async () => {
        try {
            const [bal, hist, linked] = await Promise.all([
                apiFetch(""),
                apiFetch("/history"),
                apiFetch("/linked"),
            ]);
            setBalance(bal);
            setHistory(hist);
            setLinked(linked);
            if (linked.length > 0 && !selectedAccountId) {
                setSelected(linked[0].id);
            }
        } catch (e) {
            setError("데이터 조회 실패");
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleAction = async (type) => {
        const n = parseInt(amount);
        if (!n || n <= 0) return;
        if (!selectedAccountId) {
            setError("연결 계좌를 선택해주세요");
            return;
        }
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
                    linkedBalanceId: selectedAccountId,
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

    const handleAddAccount = async () => {
        if (!newAccountNo) return;
        try {
            await apiFetch("/linked", {
                method: "POST",
                body: JSON.stringify({ bankName: newBank, accountNumber: newAccountNo }),
            });
            setNewAccountNo("");
            setShowAddForm(false);
            await fetchAll();
        } catch (e) {
            setError("계좌 추가 실패");
        }
    };

    const handleDeleteAccount = async (id) => {
        try {
            await apiFetch(`/linked/${id}`, { method: "DELETE" });
            if (selectedAccountId === id) setSelected(null);
            await fetchAll();
        } catch (e) {
            setError("계좌 삭제 실패");
        }
    };

    return (
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
            {error && <div style={styles.error}>{error}</div>}

            {/* 잔액 */}
            <div style={styles.card}>
                <p style={styles.label}>증권계좌 잔액</p>
                <p style={styles.balance}>
                    {balance === null ? "불러오는 중..." : `${balance.toLocaleString()}원`}
                </p>
            </div>

            {/* 연결 계좌 */}
            <div style={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <p style={styles.sectionTitle}>연결 계좌</p>
                    <button onClick={() => setShowAddForm(!showAddForm)} style={styles.smallBtn}>
                        {showAddForm ? "취소" : "+ 추가"}
                    </button>
                </div>

                {showAddForm && (
                    <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                        <select value={newBank} onChange={(e) => setNewBank(e.target.value)} style={styles.input}>
                            {BANKS.map(b => <option key={b}>{b}</option>)}
                        </select>
                        <input
                            type="text"
                            placeholder="계좌번호 입력"
                            value={newAccountNo}
                            onChange={(e) => setNewAccountNo(e.target.value)}
                            style={styles.input}
                        />
                        <button onClick={handleAddAccount} style={{ ...styles.btn, background: "#2563eb", color: "#fff" }}>
                            등록
                        </button>
                    </div>
                )}

                {linkedAccounts.length === 0 && !showAddForm && (
                    <p style={{ fontSize: 14, color: "var(--color-text-tertiary, #aaa)" }}>연결된 계좌 없음</p>
                )}

                {linkedAccounts.map((a) => (
                    <div key={a.id} onClick={() => setSelected(a.id)}
                         style={{
                             ...styles.accountRow,
                             background: selectedAccountId === a.id ? "#eff6ff" : "transparent",
                             border: selectedAccountId === a.id ? "1px solid #2563eb" : "1px solid var(--color-border-tertiary, #eee)",
                         }}>
                        <div>
                            <span style={{ fontWeight: 500, fontSize: 14 }}>{a.bankName}</span>
                            <span style={{ fontSize: 13, color: "var(--color-text-secondary, #666)", marginLeft: 8 }}>{a.accountNumber}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteAccount(a.id); }}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 13 }}>
                            삭제
                        </button>
                    </div>
                ))}
            </div>

            {/* 입출금 */}
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

            {/* 거래 내역 */}
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
    sectionTitle: { fontSize: 14, fontWeight: 500, color: "var(--color-text-primary, #111)", margin: 0 },
    input: {
        width: "100%", fontSize: 15, padding: "10px 12px", borderRadius: 8,
        border: "1px solid var(--color-border-tertiary, #ddd)", boxSizing: "border-box",
    },
    btn: { flex: 1, padding: "10px 0", fontSize: 15, fontWeight: 500, border: "none", borderRadius: 8, cursor: "pointer", marginTop: 10 },
    btnDeposit:  { background: "#16a34a", color: "#fff" },
    btnWithdraw: { background: "#dc2626", color: "#fff" },
    smallBtn: {
        fontSize: 13, padding: "4px 10px", border: "1px solid var(--color-border-secondary, #ddd)",
        borderRadius: 6, cursor: "pointer", background: "none", color: "var(--color-text-primary, #111)",
    },
    accountRow: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 12px", borderRadius: 8, marginBottom: 8, cursor: "pointer",
    },
    historyRow: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 0", borderTop: "1px solid var(--color-border-tertiary, #eee)",
    },
    badge: { fontSize: 12, padding: "2px 8px", borderRadius: 99, fontWeight: 500 },
};