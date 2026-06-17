import httpx
from app.chatbot.config import STOCK_SERVICE_URL

async def get_stock_code(stock_name: str) -> str | None:
    async with httpx.AsyncClient() as client:
        response=await client.get(
            f"{STOCK_SERVICE_URL}/api/stock/code",
            params={"stockName": stock_name}  # name → stockName
        )
        
        if response.status_code != 200:
            return None
            
        data=response.json()
    
    return data.get("code")