from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    question: str
    portfolio_context: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    sources: list[str]