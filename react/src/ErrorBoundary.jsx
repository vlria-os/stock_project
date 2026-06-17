import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={s.wrap}>
          <div style={s.icon}>⚠️</div>
          <div style={s.title}>일시적인 오류가 발생했습니다</div>
          <div style={s.sub}>잠시 후 다시 시도해 주세요</div>
          <button style={s.btn} onClick={() => this.setState({ hasError: false })}>
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const s = {
  wrap: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", minHeight: "60vh", gap: 12,
  },
  icon:  { fontSize: 40 },
  title: { fontSize: 18, fontWeight: 600, color: "var(--text-h)" },
  sub:   { fontSize: 14, color: "var(--text)" },
  btn: {
    marginTop: 8, padding: "8px 20px", borderRadius: 8,
    background: "var(--accent, #aa3bff)", color: "#fff",
    border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
  },
};