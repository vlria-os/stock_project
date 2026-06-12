import httpx
from config import STOCK_SERVICE_URL

async def get_stock_code(stock_name: str) -> str | None:
    async with httpx.AsyncClient() as client:
        response=await client.get(
            f"{STOCK_SERVICE_URL}/api/stock/code",
            params={"name": stock_name}
        )
        
        data=response.json()
    
    return data.get("code")