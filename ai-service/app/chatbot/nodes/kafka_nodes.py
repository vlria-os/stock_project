from kafka_client import get_producer, get_consumer
import json
import uuid

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
    
    producer=get_producer()
    producer.produce(
        "chat.order.request",
        value=json.dumps(payload),
        key=str(state["user_id"])
    )
    producer.flush()
    
    return {**state, "chat_order_id": chat_order_id}

def wait_result(state: dict) -> dict:
    chat_order_id=state["chat_order_id"]
    
    consumer=get_consumer(f"chatbot-result-{chat_order_id}")
    consumer.subscribe(["chat.order.result"])
    
    result=None
    for _ in range(30): #최대 30초 대기
        msg=consumer.poll(1.0)
        if msg and not msg.error():
            data=json.loads(msg.value().decode("utf-8"))
            if data.get("chatOrderId") == chat_order_id:
                result=data
                break
            
    consumer.close()
    return {**state, "order_result": result}

def respond(state: dict) -> dict:
    result=state.get("order_result")
    
    if not result:
        message="주문 처리 중 오류가 발생했어요. 다시 시도해주세요."
    elif result["success"]:
        side="매수" if state["order"]["order_side"] == "BUY" else "매도"
        message=f"{result['stockName']} {result['quantity']}주 {side} 주문이 체결되었습니다."
    else:
        message=f"{result['stockName']} 주문이 실패했어요. 잔고 혹은 보유 수량을 확인하세요."
        
    state["message"].append({"role": "assistant", "content": message})
    return {**state, "result": message}