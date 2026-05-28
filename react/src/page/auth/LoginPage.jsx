import { useState } from "react";
import { login as apiLogin } from "../../api/authAPI";
import { useAuth } from "../../store/AuthContext";

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiLogin(form.email, form.password);
      login(data.accessToken);
      onNavigate("dashboard");
    } catch (err) {
      setError(err?.data?.message || "이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>📈 StockApp</div>
        <h2 style={s.title}>로그인</h2>
        <form onSubmit={submit} style={s.form}>
          <label style={s.label}>이메일</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={change}
            placeholder="user@example.com"
            required
            style={s.input}
          />
          <label style={s.label}>비밀번호</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={change}
            placeholder="비밀번호"
            required
            style={s.input}
          />
          {error && <p style={s.error}>{error}</p>}
          <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
        <p style={s.footer}>
          계정이 없으신가요?{" "}
          <button onClick={() => onNavigate("signup")} style={s.link}>
            회원가입
          </button>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    padding: "40px 36px",
    border: "1px solid var(--border)",
    borderRadius: 12,
    boxShadow: "var(--shadow)",
    textAlign: "left",
  },
  logo: {
    fontSize: 20,
    fontWeight: 700,
    color: "var(--text-h)",
    marginBottom: 24,
    textAlign: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: 600,
    color: "var(--text-h)",
    margin: "0 0 20px",
    textAlign: "center",
  },
  form: { display: "flex", flexDirection: "column" },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text)",
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    padding: "10px 12px",
    border: "1px solid var(--border)",
    borderRadius: 8,
    fontSize: 14,
    color: "var(--text-h)",
    background: "var(--bg)",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  error: {
    color: "#ef4444",
    fontSize: 13,
    margin: "10px 0 0",
  },
  btn: {
    marginTop: 22,
    padding: "11px 0",
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    transition: "opacity 0.15s",
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 14,
    color: "var(--text)",
  },
  link: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--accent)",
    fontWeight: 600,
    fontSize: 14,
    padding: 0,
  },
};
