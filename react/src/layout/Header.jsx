import { useState } from "react";

const PAGES = [
  { id: "dashboard", label: "대시보드",  icon: "📊" },
  { id: "portfolio", label: "포트폴리오", icon: "💼" },
  { id: "market",    label: "시장",       icon: "🌍" },
  { id: "search",    label: "종목검색",   icon: "🔍" },
  { id: "news",      label: "뉴스",       icon: "📰" },
  { id: "balance",  label: "입출금",       icon: "⚙️" },
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
    background: "var(--color-background-primary, #ffffff)",
    borderBottom: "1px solid var(--color-border-tertiary, #eeeeee)",
    position: "sticky", top: 0, zIndex: 100,
  },
  logo: { fontWeight: 600, fontSize: 16, whiteSpace: "nowrap",
    color: "var(--color-text-primary, #111111)" },
  nav:  { display: "flex", gap: 4 },
  navBtn: {
    background: "none", border: "none", cursor: "pointer",
    padding: "6px 12px", borderRadius: 8,
    fontSize: 14, color: "var(--color-text-secondary, #666666)",
  },
  navBtnActive: {
    background: "var(--color-background-secondary, #f4f4f4)",
    color: "var(--color-text-primary, #111111)",
    fontWeight: 500,
  },
};