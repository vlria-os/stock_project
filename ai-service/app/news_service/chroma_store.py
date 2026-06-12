import chromadb
from chromadb.utils import embedding_functions
from typing import List
import hashlib
import os


CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "stock_news"


class StockNewsVectorStore:
    def __init__(self, openai_api_key: str):
        self.client = chromadb.PersistentClient(path=CHROMA_PATH)
        self.embed_fn = embedding_functions.OpenAIEmbeddingFunction(
            api_key=openai_api_key,
            model_name="text-embedding-3-small",
        )
        self.collection = self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            embedding_function=self.embed_fn,
            metadata={"hnsw:space": "cosine"},
        )

    def add_news(self, news_items: List[dict]) -> int:
        """뉴스 리스트를 ChromaDB에 임베딩 저장. 중복은 URL 해시로 방지."""
        if not news_items:
            return 0

        docs, metas, ids = [], [], []
        for item in news_items:
            doc_id = hashlib.md5(item["url"].encode()).hexdigest()

            # 이미 저장된 문서는 스킵
            existing = self.collection.get(ids=[doc_id])
            if existing["ids"]:
                continue

            docs.append(item["content"])
            metas.append(item["metadata"])
            ids.append(doc_id)

        if docs:
            self.collection.add(documents=docs, metadatas=metas, ids=ids)

        return len(docs)

    def search(self, query: str, stock: str = None, n_results: int = 5) -> List[dict]:
        """쿼리와 유사한 뉴스 청크 검색"""
        where = {"stock": stock} if stock else None

        results = self.collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where,
            include=["documents", "metadatas", "distances"],
        )

        if not results["documents"] or not results["documents"][0]:
            return []

        output = []
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            output.append({
                "content": doc,
                "metadata": meta,
                "score": round(1 - dist, 4),  # cosine similarity
            })

        return output

    def format_context(self, results: List[dict]) -> str:
        """RAG 컨텍스트를 GPT 프롬프트용 문자열로 포맷"""
        if not results:
            return "관련 뉴스 데이터 없음"

        lines = ["[참고 뉴스 컨텍스트]\n"]
        for i, r in enumerate(results, 1):
            meta = r["metadata"]
            lines.append(
                f"[{i}] {meta.get('date', '')} | {meta.get('source', '')}\n"
                f"{r['content']}\n"
            )
        return "\n".join(lines)