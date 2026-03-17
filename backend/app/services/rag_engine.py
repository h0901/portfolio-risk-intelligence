import ollama
from app.services.vector_store import search
from app.models.chat import ChatRequest, ChatResponse


SYSTEM_PROMPT = """You are an expert portfolio risk analyst assistant.
You help investors understand their portfolio risk metrics and how to improve their portfolios.
You are given:
1. The user's portfolio metrics (return, volatility, Sharpe ratio, VaR, asset breakdown)
2. Relevant financial knowledge retrieved from a knowledge base

Use both the portfolio data and the retrieved knowledge to give a clear, specific,
and actionable explanation. Always refer to the actual numbers from the portfolio.
Keep your response concise — 3 to 5 paragraphs maximum.
Do not make up numbers. Only use the metrics provided.
"""


def answer(request: ChatRequest) -> ChatResponse:
    # --- 1. Retrieve relevant documents ---
    retrieved = search(request.question, top_k=3)
    sources = [doc["title"] for doc in retrieved]

    context_text = "\n\n".join([
        f"[{doc['title']}]\n{doc['content']}"
        for doc in retrieved
    ])

    # --- 2. Build the prompt ---
    portfolio_section = ""
    if request.portfolio_context:
        portfolio_section = f"""
## User's Portfolio Metrics
{request.portfolio_context}
"""

    user_prompt = f"""
{portfolio_section}

## Retrieved Financial Knowledge
{context_text}

## User Question
{request.question}

Please answer the question using the portfolio metrics and the retrieved knowledge above.
"""

    # --- 3. Call Ollama (Llama 3.2) ---
    response = ollama.chat(
        model="llama3.2",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_prompt},
        ]
    )

    answer_text = response["message"]["content"]

    return ChatResponse(answer=answer_text, sources=sources)