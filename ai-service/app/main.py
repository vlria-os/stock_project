from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.news_service.agent import analyze_stock
from chatbot.nodes.assistant_nodes import answer_investment_question
from fastapi.middleware.cors import CORSMiddleware

app=FastAPI(title="AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://43.203.225.254:5173"],  # React 개발 서버
    allow_methods=["*"],
    allow_headers=["*"],
)

class AssistantRequest(BaseModel) :
    question : str
    stock_code : Optional[str] = None

@app.post("/ai/assistant")
def assistant(req: AssistantRequest):
    answer = answer_investment_question(req.question, req.stock_code)
    return {"answer": answer}

################뉴스 분석###################

class AnalyzeRequest(BaseModel):
    stock: str  # 종목명 (예: "삼성전자", "카카오")


class AnalyzeResponse(BaseModel):
    stock: str
    report: str


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    if not req.stock.strip():
        raise HTTPException(status_code=400, detail="종목명을 입력해주세요.")
    report = analyze_stock(req.stock.strip())
    return AnalyzeResponse(stock=req.stock, report=report)


@app.get("/health")
async def health():
    return {"status": "ok"}