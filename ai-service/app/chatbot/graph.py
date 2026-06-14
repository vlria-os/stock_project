from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from typing import TypedDict, Optional
from app.chatbot.nodes.order_nodes import extract_order, validate_order, ask_user, check_gtc
from app.chatbot.nodes.stock_nodes import fetch_stock
from app.chatbot.nodes.kafka_nodes import produce_order, wait_result, respond

class ChatState(TypedDict):
    user_id: str
    messages: list
    order: dict
    missing_fields: list
    gtc_confirmed: bool
    chat_order_id: Optional[str]
    order_result: Optional[dict]
    result: Optional[str]
    
def route_after_validate(state: ChatState) -> str:
    if state.get("missing_fields"):
        return "ask_user"
    return "check_gtc"
    
def route_after_check_gtc(state: ChatState) -> str:
    if not state.get("gtc_confirmed"):
        return "ask_user"
    return "fetch_stock"

builder=StateGraph(ChatState)

builder.add_node("extract_order", extract_order)
builder.add_node("validate_order", validate_order)
builder.add_node("ask_user", ask_user)
builder.add_node("check_gtc", check_gtc)
builder.add_node("fetch_stock", fetch_stock)
builder.add_node("produce_order", produce_order)
builder.add_node("wait_result", wait_result)
builder.add_node("respond", respond)

builder.set_entry_point("extract_order")
builder.add_edge("extract_order", "validate_order")
builder.add_conditional_edges("validate_order", route_after_validate, {
    "ask_user": "ask_user",
    "check_gtc": "check_gtc",
})
builder.add_conditional_edges("check_gtc", route_after_check_gtc, {
    "ask_user": "ask_user",
    "fetch_stock": "fetch_stock",
})
builder.add_edge("ask_user", END)
builder.add_edge("fetch_stock", "produce_order")
builder.add_edge("produce_order", "wait_result")
builder.add_edge("wait_result", "respond")
builder.add_edge("respond", END)

memory=MemorySaver()
graph=builder.compile(checkpointer=memory)

