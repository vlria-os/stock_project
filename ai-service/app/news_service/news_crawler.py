import requests
from bs4 import BeautifulSoup
from langchain.tools import tool
from typing import List
import time


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}


def _get_stock_code(query: str) -> str | None:
    """네이버 금융 검색으로 종목코드 조회"""
    url = "https://ac.stock.naver.com/ac"
    params = {"q": query, "target": "stock,fund,etf"}
    try:
        res = requests.get(url, params=params, headers=HEADERS, timeout=5)
        data = res.json()
        items = data.get("items", [])
        if items and items[0]:
            return items[0][0].get("code")
    except Exception:
        return None
    return None


def _crawl_news_list(stock_code: str, page: int = 1) -> List[dict]:
    """종목 코드로 네이버 금융 뉴스 목록 크롤링"""
    url = f"https://finance.naver.com/item/news_news.naver"
    params = {
        "code": stock_code,
        "page": page,
        "sm": "title_entity_id.basic",
        "clusterId": "",
    }
    try:
        res = requests.get(url, params=params, headers=HEADERS, timeout=8)
        res.encoding = "euc-kr"
        soup = BeautifulSoup(res.text, "html.parser")

        news_items = []
        rows = soup.select("table.type5 tr")

        for row in rows:
            title_tag = row.select_one("td.title a")
            date_tag = row.select_one("td.date")
            source_tag = row.select_one("td.info")

            if not title_tag:
                continue

            href = title_tag.get("href", "")
            news_items.append({
                "title": title_tag.get_text(strip=True),
                "url": "https://finance.naver.com" + href if href.startswith("/") else href,
                "date": date_tag.get_text(strip=True) if date_tag else "",
                "source": source_tag.get_text(strip=True) if source_tag else "",
            })

        return news_items

    except Exception as e:
        print(f"[크롤링 오류] {e}")
        return []


def _crawl_article_body(url: str) -> str:
    """개별 기사 본문 크롤링"""
    try:
        res = requests.get(url, headers=HEADERS, timeout=8)
        res.encoding = "euc-kr"
        soup = BeautifulSoup(res.text, "html.parser")

        # 네이버 금융 뉴스 본문 셀렉터
        body = soup.select_one("div#news_read")
        if body:
            return body.get_text(separator="\n", strip=True)[:2000]  # 토큰 절약

        # fallback: article 태그
        body = soup.select_one("article") or soup.select_one("div.article_body")
        if body:
            return body.get_text(separator="\n", strip=True)[:2000]

    except Exception:
        pass
    return ""


@tool
def crawl_stock_news(query: str) -> str:
    """
    종목명 또는 티커를 입력받아 네이버 금융에서 관련 뉴스를 크롤링합니다.
    최신 뉴스 10개의 제목, 날짜, 본문 요약을 반환합니다.
    """
    stock_code = _get_stock_code(query)
    if not stock_code:
        return f"'{query}' 종목을 찾을 수 없습니다. 종목명을 정확히 입력해주세요."

    news_list = _crawl_news_list(stock_code, page=1)
    if not news_list:
        return f"'{query}' 관련 뉴스를 찾을 수 없습니다."

    results = []
    for i, news in enumerate(news_list[:10]):
        body = _crawl_article_body(news["url"])
        results.append({
            **news,
            "body": body,
        })
        time.sleep(0.3)  # 크롤링 딜레이

    # 텍스트로 직렬화해서 반환 (에이전트가 읽을 수 있도록)
    output_lines = [f"[{query} 관련 최신 뉴스 {len(results)}건]\n"]
    for i, r in enumerate(results, 1):
        output_lines.append(
            f"--- 뉴스 {i} ---\n"
            f"제목: {r['title']}\n"
            f"날짜: {r['date']} | 출처: {r['source']}\n"
            f"본문:\n{r['body']}\n"
        )

    return "\n".join(output_lines)


# 벡터스토어 저장용으로 구조화된 데이터도 반환하는 함수 (RAG 파이프라인용)
def fetch_news_for_rag(query: str) -> List[dict]:
    stock_code = _get_stock_code(query)
    if not stock_code:
        return []

    news_list = _crawl_news_list(stock_code)
    results = []
    for news in news_list[:10]:
        body = _crawl_article_body(news["url"])
        if body:
            results.append({
                "title": news["title"],
                "date": news["date"],
                "source": news["source"],
                "url": news["url"],
                "content": f"{news['title']}\n{body}",
                "metadata": {
                    "stock": query,
                    "date": news["date"],
                    "source": news["source"],
                    "url": news["url"],
                }
            })
        time.sleep(0.3)

    return results