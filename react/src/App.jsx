import { useState } from "react";
import Header from "./layout/Header";
import Balance from "./page/balance/Balance.jsx";
import { AuthProvider, useAuth } from "./store/AuthContext";
import LoginPage from "./page/auth/LoginPage";
import SignupPage from "./page/auth/SignupPage";
import MarketPage from "./page/stock/MarketPage";
import SearchPage from "./page/stock/SearchPage";

const PAGE_COMPONENTS = {
  dashboard: () => <div>대시보드 페이지</div>,
  portfolio: () => <div>포트폴리오 페이지</div>,
  market:    MarketPage,
  search:    SearchPage,
  news:      () => <div>뉴스 페이지</div>,
  balance:   () => Balance,
  login:     LoginPage,
  signup:    SignupPage,
};

// 로그인이 필요한 페이지 — 비로그인 시 로그인 페이지로 이동
const PROTECTED = new Set(["balance", "portfolio"]);

function MainApp() {
  const [page, setPage] = useState("dashboard");
  const { isAuthenticated, logout } = useAuth();

  const navigate = (target) => {
    if (PROTECTED.has(target) && !isAuthenticated) {
      setPage("login");
    } else {
      setPage(target);
    }
  };

  const PageComponent = PAGE_COMPONENTS[page] ?? PAGE_COMPONENTS.dashboard;

  return (
    <>
      <Header
        currentPage={page}
        onNavigate={navigate}
        isAuthenticated={isAuthenticated}
        onLogin={() => setPage("login")}
        onLogout={logout}
      />
      <main style={{ padding: "32px 24px", maxWidth: 960, margin: "0 auto" }}>
        <PageComponent onNavigate={navigate} />
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
