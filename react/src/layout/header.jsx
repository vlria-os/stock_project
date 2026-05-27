// Header.jsx
import { useState } from "react";

const PAGES = [
  { id: "dashboard", label: "대시보드",  icon: "📊" },
  { id: "portfolio", label: "포트폴리오", icon: "💼" },
  { id: "market",    label: "시장",       icon: "🌍" },
  { id: "search",    label: "종목검색",   icon: "🔍" },
  { id: "news",      label: "뉴스",       icon: "📰" },
  { id: "settings",  label: "설정",       icon: "⚙️" },
];

export default function Header({ currentPage, onNavigate }) {
  return (
    <header style={styles.header}>
      <div style={styles.logo}>📈 StockApp</div>
      <nav style={styles.nav}>
        {PAGES.map((p) => (
          <button
            key={p.id}
            onClick={() => onNavigate(p.id)}
            style={{
              ...styles.navBtn,
              ...(currentPage === p.id ? styles.navBtnActive : {}),
            }}
          >
            {p.icon} {p.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

const styles = {
  header: {
    display: "flex", alignItems: "center", gap: 24,
    padding: "0 24px", height: 56,
    background: "#fff", borderBottom: "1px solid #eee",
    position: "sticky", top: 0, zIndex: 100,
  },
  logo: { fontWeight: 600, fontSize: 16, whiteSpace: "nowrap" },
  nav:  { display: "flex", gap: 4 },
  navBtn: {
    background: "none", border: "none", cursor: "pointer",
    padding: "6px 12px", borderRadius: 8,
    fontSize: 14, color: "#666",
  },
  navBtnActive: {
    background: "#f4f4f4", color: "#111", fontWeight: 500,
  },
};