import asyncio
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from app.news_service.agent import analyze_stock
from app.chatbot.nodes.assistant_nodes import answer_investment_question
from fastapi.middleware.cors import CORSMiddleware
from app.chatbot.graph import graph

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

@app.post("/api/ai/assistant")
def assistant(req: AssistantRequest):
    answer = answer_investment_question(req.question, req.stock_code)
    return {"answer": answer}

################뉴스 분석###################

class AnalyzeRequest(BaseModel):
    stock: str  # 종목명 (예: "삼성전자", "카카오")


class AnalyzeResponse(BaseModel):
    stock: str
    report: str


@app.post("/api/ai/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    if not req.stock.strip():
        raise HTTPException(status_code=400, detail="종목명을 입력해주세요.")
    report = await asyncio.get_event_loop().run_in_executor(None, analyze_stock, req.stock.strip())
    return AnalyzeResponse(stock=req.stock, report=report)


@app.get("/health")
async def health():
    return {"status": "ok"}

#################### 자연어 주문 챗봇 #####################

class ChatRequest(BaseModel):
    thread_id: str
    message: str
    
@app.post("/api/ai/chat")
async def chat(request: ChatRequest, x_user_id: str = Header(...)):
    config={"configurable": {"thread_id": request.thread_id}}
    
    #이전 state 복원
    current_state=graph.get_state(config)
    messages=current_state.values.get("messages", []) if current_state.values else []
    messages.append({"role": "user", "content": request.message})
    
    result=await graph.ainvoke(
        {
            "user_id": x_user_id,
            "messages": messages,
            "order": {},
            "missing_fields": [],
            "gtc_confirmed": False,
            "chat_order_id": None,
            "order_result": None,
            "result": None,
        },
        config=config
    )
    
    return {"message": result["result"]}