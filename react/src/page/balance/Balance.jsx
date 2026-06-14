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
        <div style={styles.page}>
            {error && <div style={styles.error}>{error}</div>}

            {/* 잔액 */}
            <div style={styles.card}>
                <div style={styles.balanceLabel}>증권계좌 잔액</div>
                <div style={styles.balanceAmount}>
                    {balance === null ? "불러오는 중..." : `${balance.toLocaleString()}원`}
                </div>
            </div>

            <div style={styles.twoCol}>
                {/* 연결 계좌 */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.sectionTitle}>연결 계좌</div>
                        <button onClick={() => setShowAddForm(!showAddForm)} style={styles.smallBtn}>
                            {showAddForm ? "취소" : "+ 추가"}
                        </button>
                    </div>

                    {showAddForm && (
                        <div style={styles.addForm}>
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
                            <button onClick={handleAddAccount} style={styles.registerBtn}>등록</button>
                        </div>
                    )}

                    {linkedAccounts.length === 0 && !showAddForm && (
                        <div style={styles.empty}>연결된 계좌 없음</div>
                    )}

                    {linkedAccounts.map((a) => {
                        const active = selectedAccountId === a.id;
                        return (
                            <div key={a.id} onClick={() => setSelected(a.id)}
                                style={{
                                    ...styles.accountRow,
                                    background: active ? "var(--accent-bg, rgba(170,59,255,0.08))" : "transparent",
                                    border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
                                }}>
                                <div>
                                    <span style={styles.bankName}>{a.bankName}</span>
                                    <span style={styles.accountNo}>{a.accountNumber}</span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteAccount(a.id); }}
                                    style={styles.deleteBtn}>
                                    삭제
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* 입출금 */}
                <div style={styles.card}>
                    <div style={styles.sectionTitle}>입출금</div>
                    <input
                        type="number"
                        placeholder="금액 입력 (원)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={{ ...styles.input, marginTop: 14 }}
                        disabled={loading}
                    />
                    <div style={styles.actionBtns}>
                        <button onClick={() => handleAction("deposit")} disabled={loading}
                            style={{ ...styles.actionBtn, background: "#16a34a" }}>
                            {loading ? "처리 중..." : "입금"}
                        </button>
                        <button onClick={() => handleAction("withdraw")} disabled={loading}
                            style={{ ...styles.actionBtn, background: "#ef4444" }}>
                            {loading ? "처리 중..." : "출금"}
                        </button>
                    </div>
                </div>
            </div>

            {/* 거래 내역 */}
            <div style={styles.card}>
                <div style={styles.sectionTitle}>거래 내역</div>
                {history.length === 0 && (
                    <div style={styles.empty}>내역 없음</div>
                )}
                {history.map((h) => {
                    const t = TYPE_LABEL[h.type] ?? { text: h.type, color: "#666", bg: "#f3f4f6" };
                    const signed = ["DEPOSIT", "SELL_CONFIRM", "UNLOCK"].includes(h.type) ? "+" : "-";
                    return (
                        <div key={h.historyId} style={styles.historyRow}>
                            <div style={styles.historyLeft}>
                                <span style={{ ...styles.badge, background: t.bg, color: t.color }}>{t.text}</span>
                                <span style={styles.historyDate}>{h.createAt?.slice(0, 10)}</span>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontWeight: 600, fontSize: 14, color: t.color }}>
                                    {signed}{h.amount.toLocaleString()}원
                                </div>
                                <div style={styles.balanceAfter}>
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
    page: { display: "flex", flexDirection: "column", gap: 14 },
    card: {
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px 24px",
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    twoCol: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
    },
    error: {
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.3)",
        color: "#ef4444",
        borderRadius: 10,
        padding: "10px 16px",
        fontSize: 14,
    },
    balanceLabel: { fontSize: 12, color: "var(--text)", marginBottom: 8 },
    balanceAmount: { fontSize: 34, fontWeight: 700, color: "var(--text-h)" },
    sectionTitle: { fontSize: 14, fontWeight: 600, color: "var(--text-h)", margin: 0 },
    input: {
        width: "100%",
        fontSize: 14,
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid var(--border)",
        background: "var(--bg)",
        color: "var(--text-h)",
        boxSizing: "border-box",
        outline: "none",
    },
    addForm: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 },
    registerBtn: {
        padding: "9px 0",
        background: "var(--accent, #aa3bff)",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
    },
    actionBtns: { display: "flex", gap: 8, marginTop: 10 },
    actionBtn: {
        flex: 1,
        padding: "11px 0",
        fontSize: 14,
        fontWeight: 600,
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        color: "#fff",
    },
    smallBtn: {
        fontSize: 12,
        padding: "4px 10px",
        border: "1px solid var(--border)",
        borderRadius: 6,
        cursor: "pointer",
        background: "none",
        color: "var(--text)",
    },
    accountRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 12px",
        borderRadius: 8,
        marginBottom: 8,
        cursor: "pointer",
        transition: "background 0.15s",
    },
    bankName: { fontWeight: 600, fontSize: 14, color: "var(--text-h)" },
    accountNo: { fontSize: 12, color: "var(--text)", marginLeft: 8 },
    deleteBtn: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#ef4444",
        fontSize: 12,
        padding: "3px 6px",
    },
    empty: {
        padding: "20px 0",
        textAlign: "center",
        fontSize: 13,
        color: "var(--text)",
    },
    historyRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderTop: "1px solid var(--border)",
    },
    historyLeft: { display: "flex", alignItems: "center", gap: 10 },
    historyDate: { fontSize: 12, color: "var(--text)" },
    balanceAfter: { fontSize: 12, color: "var(--text)", marginTop: 2 },
    badge: {
        fontSize: 11,
        padding: "3px 8px",
        borderRadius: 99,
        fontWeight: 600,
        whiteSpace: "nowrap",
    },
};