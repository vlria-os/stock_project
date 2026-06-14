from app.chatbot.stock_client import get_stock_code

async def fetch_stock(state: dict) -> dict:
    stock_name = state["order"]["stock_name"]
    stock_code = await get_stock_code(stock_name)
    
    if not stock_code:
        state["message"].append({
            "role": "assistant",
            "content": f"'{stock_name}' 종목을 찾을 수 없어요. 종목명을 다시 확인해주세요."
        })
        
        return {**state, "stock_code": None, "result": "종목 없음"}
        
    state["order"]["stock_code"] = stock_code
    return {**state}