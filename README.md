# Portfolio Risk Intelligence System

## Overview
AI-powered platform to analyze investment portfolio risk using advanced financial metrics and LLM-based insights.

## Features
- Portfolio upload & parsing
- Risk analysis (volatility, diversification, sector exposure)
- AI-powered insights (RAG-based explanations)
- Interactive dashboard

## Tech Stack
Frontend: Angular  
Backend: FastAPI (Python)  
AI: Embeddings + RAG pipeline  
Data: Financial APIs / historical data

## How to Run
# backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# frontend
npm install
ng serve
