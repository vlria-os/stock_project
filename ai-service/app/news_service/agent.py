import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.tools import tool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from app.news_service.news_crawler import crawl_stock_news, fetch_news_for_rag
from app.news_service.chroma_store import StockNewsVectorStore

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
vector_store = StockNewsVectorStore(openai_api_key=OPENAI_API_KEY)


# ── RAG 검색 Tool ────────────────────────────────────────────────
@tool
def search_news_rag(query: str) -> str:
    """
    이미 수집된 뉴스 데이터베이스에서 질문과 관련된 내용을 벡터 검색합니다.
    크롤링 후 심층 분석이 필요할 때 사용합니다.
    """
    results = vector_store.search(query=query, n_results=5)
    return vector_store.format_context(results)


# ── 뉴스 수집 + 벡터 저장을 합친 Tool ──────────────────────────────
@tool
def fetch_and_store_news(stock_name: str) -> str:
    """
    종목 뉴스를 크롤링하고 벡터DB에 저장합니다.
    새로운 종목 분석 시작 시 반드시 먼저 호출해야 합니다.
    """
    news_items = fetch_news_for_rag(stock_name)
    if not news_items:
        return f"'{stock_name}' 뉴스를 가져오지 못했습니다."

    added = vector_store.add_news(news_items)
    return (
        f"'{stock_name}' 뉴스 {len(news_items)}건 수집 완료 "
        f"(신규 저장: {added}건). 이제 RAG 검색을 사용할 수 있습니다."
    )


# ── Agent 설정 ──────────────────────────────────────────────────
SYSTEM_PROMPT = """당신은 주식 뉴스 분석 전문 AI입니다.

사용자가 종목을 입력하면 다음 순서로 작업하세요:
1. fetch_and_store_news로 최신 뉴스 수집 및 저장
2. search_news_rag로 핵심 정보 검색
3. 수집된 정보를 바탕으로 아래 형식의 분석 리포트 작성

리포트 형식:
## [종목명] 뉴스 분석 리포트

### 📰 주요 뉴스 요약
- 최근 주요 이슈 3~5개 불릿

### 📈 긍정적 요인
- 호재 요소 분석

### 📉 리스크 요인
- 악재 또는 불확실성 분석

### 🔮 단기 전망
- 뉴스 기반 단기 방향성 의견

⚠️ 면책: 본 분석은 뉴스 기반 AI 리포트로 투자 권유가 아닙니다.
"""

def build_agent() -> AgentExecutor:
    llm = ChatOpenAI(
        model="gpt-4o",
        temperature=0.3,
        openai_api_key=OPENAI_API_KEY,
    )

    tools = [fetch_and_store_news, search_news_rag, crawl_stock_news]

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])

    agent = create_openai_tools_agent(llm=llm, tools=tools, prompt=prompt)

    return AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        max_iterations=5,
        handle_parsing_errors=True,
    )


def analyze_stock(stock_name: str) -> str:
    agent = build_agent()
    result = agent.invoke({"input": f"{stock_name} 종목의 최신 뉴스를 분석해줘"})
    return result["output"]


if __name__ == "__main__":
    stock = input("분석할 종목명 입력: ").strip()
    print("\n" + "=" * 60)
    report = analyze_stock(stock)
    print(report)