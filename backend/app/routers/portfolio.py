from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.portfolio_parser import parse_portfolio_csv
from app.models.portfolio import ParsedPortfolio

router = APIRouter()

@router.post("/upload", response_model=ParsedPortfolio)
async def upload_portfolio(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted.")

    contents = await file.read()

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    return parse_portfolio_csv(contents)