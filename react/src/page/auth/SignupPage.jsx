import { useState } from "react";
import { signup as apiSignup, login as apiLogin } from "../../api/authAPI";
import { useAuth } from "../../store/AuthContext";

export default function SignupPage({ onNavigate }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiSignup(form.email, form.password, form.name);
      const data = await apiLogin(form.email, form.password);
      login(data.accessToken);
      onNavigate("dashboard");
    } catch (err) {
      setError(err?.data?.message || "회원가입에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>📈 StockApp</div>
        <h2 style={s.title}>회원가입</h2>
        <form onSubmit={submit} style={s.form}>
          <label style={s.label}>이름</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={change}
            placeholder="홍길동"
            required
            style={s.input}
          />
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
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>
        <p style={s.footer}>
          이미 계정이 있으신가요?{" "}
          <button onClick={() => onNavigate("login")} style={s.link}>
            로그인
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
