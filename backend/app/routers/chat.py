from fastapi import APIRouter, HTTPException
from app.models.chat import ChatRequest, ChatResponse
from app.services.rag_engine import answer

router = APIRouter()

@router.post("/ask", response_model=ChatResponse)
def ask(request: ChatRequest):
    try:
        return answer(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG engine error: {str(e)}")