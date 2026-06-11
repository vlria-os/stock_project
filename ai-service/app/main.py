from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from chatbot.nodes.assistant_nodes import answer_investment_question

app=FastAPI(title="AI Service")

class AssistantRequest(BaseModel) :
    question : str
    stock_code : Optional[str] = None

@app.post("/ai/assistant")
def assistant(req: AssistantRequest):
    answer = answer_investment_question(req.question, req.stock_code)
    return {"answer": answer}