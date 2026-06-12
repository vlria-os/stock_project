import { useEffect, useState } from "react";
import Header from "./layout/Header";
import Balance from "./page/balance/Balance.jsx";
import DashboardPage from "./page/dashboard/DashboardPage";
import { AuthProvider, useAuth } from "./store/AuthContext";
import LoginPage from "./page/auth/LoginPage";
import SignupPage from "./page/auth/SignupPage";
import MarketPage from "./page/stock/MarketPage";
import SearchPage from "./page/stock/SearchPage";
import MyPage from "./page/mypage/MyPage";
import AIPage from "./page/ai/AIPage";
import { connectTradeSSE } from "./api/sse.js";
import toast, { Toaster } from "react-hot-toast";
import OrderBook from "./page/trade/OrderBook.jsx";
import Order from "./page/trade/Order.jsx";
import Holdings from "./page/trade/Holdings.jsx";
import OrderList from "./page/trade/OrderList.jsx";
import TradeList from "./page/trade/TradeList.jsx";
import PendingOrders from "./page/trade/PendingOrders.jsx";

const PAGE_COMPONENTS = {
  dashboard: DashboardPage,
  portfolio: () => <div>포트폴리오 페이지</div>,
  market:    MarketPage,
  search:    SearchPage,
  news:      () => <div>뉴스 페이지</div>,
  balance:   Balance,
  login:     LoginPage,
  signup:    SignupPage,
  mypage:    MyPage,
  orderbook: OrderBook,
  order: Order,
  holdings: Holdings,
  orders: OrderList,
  trades: TradeList,
  pendingOrders: PendingOrders,
  ai: AIPage,
};

// 로그인이 필요한 페이지 — 비로그인 시 로그인 페이지로 이동
const PROTECTED = new Set(["balance", "portfolio", "mypage",
  "order", "holdings", "orders", "trades"
]);

function MainApp() {
  const [page, setPage] = useState("dashboard");
  const [props, setProps] = useState({});

  const { isAuthenticated, logout } = useAuth();

  //sse
  useEffect(() => {
      if (!isAuthenticated) return;

      let es = null;
      let cancelled = false;

      connectTradeSSE(
          (data) => toast.success(`${data.price}원에 ${data.filledQuantity}주가 체결되었습니다.`),
          (data) => toast.error(data.message)
      ).then(eventSource => {
          if (cancelled) {
              eventSource.close();  // 이미 로그아웃됐으면 바로 닫기
              return;
          }
          es = eventSource;
      });

      return () => {
          cancelled = true;
          es?.close();
      };
  }, [isAuthenticated]);

  const navigate = (target, props = {}) => {
    if (PROTECTED.has(target) && !isAuthenticated) {
      setPage("login");
    } else {
      setPage(target);
      setProps(props);
    }
  };

  const PageComponent = PAGE_COMPONENTS[page] ?? PAGE_COMPONENTS.dashboard;

  return (
    <>
      <Toaster position="bottom-right"/>
      <Header
        currentPage={page}
        onNavigate={navigate}
        isAuthenticated={isAuthenticated}
        onLogin={() => setPage("login")}
        onLogout={() => { logout(); setPage("login"); }}
      />
      <main style={{ padding: "32px 24px", maxWidth: 960, margin: "0 auto" }}>
        <PageComponent onNavigate={navigate} {...props}/>
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
