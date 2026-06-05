from langchain_openai import ChatOpenAI
from schemas import OrderType, OrderCondition
from config import OPENAI_API_KEY
import json

llm=ChatOpenAI(model="gpt-4o-mini", api_key=OPENAI_API_KEY)

EXTRACT_PROMPT="""
당신은 주식 거래 플랫폼의 자연어 주문 어시스턴트입니다.
사용자의 주식 주문 메시지에서 아래 정보를 추출해 JSON으로만 응답하세요.

필드:
- stock_name: 종목명 (예: 삼성전자)
- order_side: 매수/사다/살래/사줘 -> BUY, 매도/팔다/팔래/팔아줘 -> SELL
- order_type: 시장가/즉시/바로 -> MARKET, 지정가/가격 지정 -> LIMIT
- order_condition: GTC/취소 전 유효/대기/체결될 때까지 -> GTC, IOC/즉시 체결 -> IOC, FOK/전량 체결 -> FOK
- quantity: 수량 (정수, "백주" -> 100, "천 주" -> 1000)
- price: 가격 (LIMIT일 때만, 정수)
- expired_at: 만료일 (GTC이고 사용자가 명시했을 때만, YYYY-MM-DD, 없으면 null)

모르는 필드는 null로 두세요.
JSON 외 다른 텍스트 없이 응답하세요.

대화 내역:
{message}
"""

MISSING_FIELD_QUESTIONS={
    "stock_name": "어떤 종목을 주문하시겠어요?",
    "order_side": "매수인가요, 매도인가요?",
    "order_type": "시장가 주문인가요, 지정가 주문인가요?",
    "order_condition": (
        "주문 조건을 선택해주세요. \n"
        "- GTC: 체결될 때까지 유지 (취소 전까지 유효)\n"
        "- IOC: 즉시 체결 가능한 수량만 체결, 나머지 취소\n"
        "- FOK: 전량 즉시 체결 안 되면 전체 취소"
    ),
    "quantity": "주문할 수량이 몇 주인가요?",
    "price": "지정가 가격을 알려주세요."
}

def extract_order(state: dict) -> dict:
    message_text="\n".join(
        f"{'사용자' if m['role'] == 'user' else '봇'}: {m['content']}"
        for m in state["messages"]
    )
    
    prompt=EXTRACT_PROMPT.format(messages=message_text)
    response=llm.invoke(prompt)
    
    try:
        order=json.loads(response.content)
    except:
        order={}
        
    return {**state, "order": order}

def validate_order(state: dict) -> dict:
    order=state["order"]
    missing=[]
    
    required=["stock_name", "order_side", "order_type", "order_condition", "quantity"]
    for field in required:
        if not order.get(field):
            missing.append(field)
            
    if order.get("order_type") == "LIMIT" and not order.get("price"):
        missing.append("price")
        
    return {**state, "missing_fields": missing}


