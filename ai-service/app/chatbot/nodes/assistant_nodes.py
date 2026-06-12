from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.chatbot.config import OPENAI_API_KEY, STOCK_SERVICE_URL
import requests

llm = ChatOpenAI(model="gpt-4o-mini", api_key=OPENAI_API_KEY)

def get_stock_info(stock_code: str):
    try:
        res = requests.get(f"{STOCK_SERVICE_URL}/stocks/{stock_code}/price")
        return res.json()
    except:
        return None
    
def answer_investment_question(question: str, stock_code: str = None):
    context = ""
    if stock_code:
        stock_info = get_stock_info(stock_code)
        if stock_info:
            context = f"현재 {stock_code} 주가 정보: {stock_info}\n"
        
    messages = [
        SystemMessage(content=
        """당신은 AI 투자 어시스턴트입니다.
        - 주가 데이터가 주어지면 수치를 기반으로 분석해주세요
        - 투자 위험성을 항상 언급하세요
        - 매수/매도 시점, 목표가, 손절가 등 구체적인 수치로 답변하세요
        - 한국 주식 시장 기준으로 답변하세요
        """),
        HumanMessage(content=f"{context}{question}")
    ]
    
    response = llm.invoke(messages)
    return response.content