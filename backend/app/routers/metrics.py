from fastapi import APIRouter, HTTPException
from app.models.portfolio import (
    MetricsRequest, RiskMetrics, SectorResponse,
    SectorExposure, HistoricalPerformance
)
from app.services.risk_engine import compute_risk_metrics, compute_return_distribution
from app.services.sector_mapper import get_sector_exposure
from app.services.historical_performance import compute_historical_performance

router = APIRouter()

@router.post("/compute", response_model=RiskMetrics)
def compute_metrics(request: MetricsRequest):
    try:
        return compute_risk_metrics(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk computation failed: {str(e)}")

@router.post("/sectors", response_model=SectorResponse)
def get_sectors(request: MetricsRequest):
    try:
        metrics = compute_risk_metrics(request)
        holdings_with_weights = [
            {"ticker": a.ticker, "weight": a.weight}
            for a in metrics.assets
        ]
        sectors = get_sector_exposure(holdings_with_weights)
        top = sectors[0] if sectors else {"sector": "Unknown", "weight": 0}
        return SectorResponse(
            sectors=[SectorExposure(**s) for s in sectors],
            concentrated=top["weight"] > 50,
            top_sector=top["sector"],
            top_sector_weight=top["weight"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/historical", response_model=HistoricalPerformance)
def get_historical(request: MetricsRequest):
    try:
        return compute_historical_performance(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/distribution")
def get_distribution(request: MetricsRequest):
    try:
        return compute_return_distribution(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))