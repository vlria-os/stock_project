// App.jsx
import { useState } from "react";
import Header from "./Header";

const PAGE_COMPONENTS = {
  dashboard: () => <div>대시보드 페이지</div>,
  portfolio: () => <div>포트폴리오 페이지</div>,
  market:    () => <div>시장 페이지</div>,
  search:    () => <div>종목검색 페이지</div>,
  news:      () => <div>뉴스 페이지</div>,
  settings:  () => <div>설정 페이지</div>,
};

export default function App() {
  const [page, setPage] = useState("dashboard");
  const PageComponent = PAGE_COMPONENTS[page];
  return (
    <>
      <Header currentPage={page} onNavigate={setPage} />
      <main style={{ padding: "32px 24px", maxWidth: 960, margin: "0 auto" }}>
        <PageComponent />
      </main>
    </>
  );
}