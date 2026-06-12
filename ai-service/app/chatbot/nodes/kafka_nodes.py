from confluent_kafka import Producer, Consumer
from config import KAFKA_HOST
import json
import uuid

producer=Producer({'bootstrap.servers': KAFKA_HOST})

def produce_order(state: dict) -> dict:
    order = state["order"]
    chat_order_id=str(uuid.uuid4())
    
    payload={
        "chatOrderId": chat_order_id,
        "stockCode": order["order_side"],
        "side": order["order_side"],
        "orderType": order["order_type"],
        "orderCondition": order["order_condition"],
        "quantity": order["quantity"],
        "price": order.get("price"),
        "expiredAt": order.get("expired_at")
    }
    
    producer.produce(
        "chat.order.request",
        value=json.dumps(payload),
        key=str(state["user_id"])
    )
    producer.flush()
    
    return {**state, "chat_order_id": chat_order_id}

