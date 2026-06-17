import logging
import re
import time
import xml.etree.ElementTree as ET

import requests
from bs4 import BeautifulSoup
from langchain_core.tools import tool
from typing import List

logger = logging.getLogger(__name__)

RSS_URL = "https://www.hankyung.com/feed/finance"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}


def _build_keywords(stock_name: str) -> List[str]:
    """종목명을 공백·괄호·영한 경계로 분리해 키워드 리스트 반환 (길이 긴 순)"""
    parts = re.split(r'[\s()（）]+', stock_name)
    tokens = []
    for part in parts:
        # 영문/숫자 ↔ 한글 경계에서 추가 분리 (예: SK하이닉스 → SK, 하이닉스)
        sub = re.split(r'(?<=[a-zA-Z0-9])(?=[가-힣])|(?<=[가-힣])(?=[a-zA-Z0-9])', part)
        tokens.extend(sub)
    # 길이 2 이상만 남기고, 길이 긴 순으로 정렬 (긴 키워드 = 더 특정적)
    return sorted({k for k in tokens if len(k) >= 2}, key=len, reverse=True)


def _fetch_rss_items(stock_name: str) -> List[dict]:
    """한국경제 RSS에서 종목명 포함 기사 필터링 (정확 매칭 우선, 없으면 키워드 폴백)"""
    try:
        res = requests.get(RSS_URL, headers=HEADERS, timeout=10)
        res.raise_for_status()
        root = ET.fromstring(res.content)

        all_items = root.findall(".//item")
        logger.info("[_fetch_rss_items] RSS 전체 기사: %d건", len(all_items))

        parsed = []
        for item in all_items:
            title = (item.findtext("title") or "").strip()
            link_elem = item.find("link")
            link = (
                (link_elem.text or link_elem.tail or "").strip()
                if link_elem is not None else ""
            )
            parsed.append({
                "title": title,
                "url": link,
                "date": (item.findtext("pubDate") or "").strip(),
                "source": "한국경제",
                "summary": (item.findtext("description") or "").strip(),
            })

        for item in parsed[:5]:
            logger.info("[RSS 샘플] %s", item.get("title", ""))

        def _text(item: dict) -> str:
            return item["title"] + " " + item["summary"]

        # 1단계: 종목명 전체 정확 매칭
        matched = [it for it in parsed if stock_name in _text(it)]
        if matched:
            logger.info("[_fetch_rss_items] 정확 매칭: '%s' → %d건", stock_name, len(matched))
            return matched

        # 2단계: 0건이면 키워드 폴백 (길이 긴 키워드부터 순서대로 시도)
        keywords = _build_keywords(stock_name)
        logger.info("[_fetch_rss_items] 정확 매칭 0건 → 키워드 폴백: %s", keywords)
        matched = [it for it in parsed if any(k in _text(it) for k in keywords)]
        logger.info("[_fetch_rss_items] 키워드 매칭: '%s' → %d건", stock_name, len(matched))
        return matched

    except Exception as e:
        logger.error("[_fetch_rss_items] RSS 요청 실패: %s", e)
        return []


def _crawl_article_body(url: str, fallback: str = "") -> str:
    """한국경제 기사 본문 크롤링. 실패 시 RSS description(fallback) 반환"""
    if not url:
        return fallback
    try:
        res = requests.get(url, headers=HEADERS, timeout=8)
        soup = BeautifulSoup(res.text, "html.parser")

        for selector in ("div.article-body", "div#articlebody", "div.article_body", "article"):
            body = soup.select_one(selector)
            if body:
                return body.get_text(separator="\n", strip=True)[:2000]

    except Exception as e:
        logger.warning("[_crawl_article_body] 본문 수집 실패 (%s): %s", url, e)

    return fallback[:2000]


@tool
def crawl_stock_news(query: str) -> str:
    """
    종목명을 입력받아 한국경제 RSS에서 관련 뉴스를 가져옵니다.
    최신 뉴스 10개의 제목, 날짜, 본문 요약을 반환합니다.
    """
    items = _fetch_rss_items(query)
    if not items:
        return f"'{query}' 관련 뉴스를 찾을 수 없습니다."

    output_lines = [f"[{query} 관련 최신 뉴스 {len(items[:10])}건]\n"]
    for i, news in enumerate(items[:10], 1):
        body = _crawl_article_body(news["url"], fallback=news["summary"])
        output_lines.append(
            f"--- 뉴스 {i} ---\n"
            f"제목: {news['title']}\n"
            f"날짜: {news['date']} | 출처: {news['source']}\n"
            f"본문:\n{body}\n"
        )
        time.sleep(0.2)

    return "\n".join(output_lines)


def fetch_news_for_rag(query: str) -> List[dict]:
    """벡터스토어 저장용 구조화 데이터 반환 (RAG 파이프라인용)"""
    items = _fetch_rss_items(query)

    results = []
    for news in items[:10]:
        body = _crawl_article_body(news["url"], fallback=news["summary"])
        if not body:
            continue
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
            },
        })
        time.sleep(0.2)

    return results
