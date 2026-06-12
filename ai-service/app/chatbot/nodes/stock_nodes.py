import httpx
from config import STOCK_SERVICE_URL

async def fetch_stock(state: dict) -> dict:
    stock_name = state["order"]["stock_name"]
    
    async with httpx.AsyncClient() as client:
        response=await client.get(
            f"{STOCK_SERVICE_URL}/api/stock",
            params={"name": stock_name}
        )
        data = response.json()
        
    stock_code = data.get("code")
    
    if not stock_code:
        state["message"].append({
            "role": "assistant",
            "content": f"'{stock_name}' 종목을 찾을 수 없어요. 종목명을 다시 확인해주세요."
        })
        
        return {**state, "stock_code": None, "result": "종목 없음"}
        
    state["order"]["stock_code"] = stock_code
    return {**state}