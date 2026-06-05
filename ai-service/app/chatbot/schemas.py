from pydantic import BaseModel
from typing import Optional, Literal
from enum import Enum
from datetime import date

class OrderType(str, Enum):
    MARKET="MARKET"
    LIMIT="LIMIT"
    
class OrderSide(str, Enum):
    BUY="BUY"
    SELL="SELL"
    
class OrderCondition(str, Enum):
    GTC="GTC"
    IOC="IOC"
    FOK="FOK"
    
class OrderRequest(BaseModel):
    user_id: str
    stock_name: Optional[str] = None #llm이 추출, 종목 코드 변환 전
    stock_code: Optional[str] = None #stock service 호출 후 채워짐
    order_type: Optional[OrderType] = None
    order_condition: Optional[OrderCondition] = None
    quantity: Optional[int] = None
    price: Optional[int] = None #LIMIT
    expired_at: Optional[date] = None #GTC
    
class OrderResult(BaseModel):
    success: bool
    message: str
    order_id: Optional[str] = None