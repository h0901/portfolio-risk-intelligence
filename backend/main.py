from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import portfolio, metrics, chat
from app.services.vector_store import build_index

app = FastAPI(title="Portfolio Risk Platform", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(portfolio.router, prefix="/api/portfolio", tags=["portfolio"])
app.include_router(metrics.router,   prefix="/api/metrics",   tags=["metrics"])
app.include_router(chat.router,      prefix="/api/chat",      tags=["chat"])

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.on_event("startup")
def startup():
    build_index()