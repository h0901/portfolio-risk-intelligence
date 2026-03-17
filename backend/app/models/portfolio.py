from pydantic import BaseModel
from typing import Optional

class Holding(BaseModel):
    ticker: str
    shares: float
    price: Optional[float] = None
    value: Optional[float] = None
    weight: Optional[float] = None

class ParsedPortfolio(BaseModel):
    holdings: list[Holding]
    total_value: float
    errors: list[str]

class HoldingInput(BaseModel):
    ticker: str
    shares: float

class MetricsRequest(BaseModel):
    holdings: list[HoldingInput]

class AssetMetrics(BaseModel):
    ticker: str
    weight: float
    annual_return: float
    volatility: float
    contribution_to_risk: float

class RiskMetrics(BaseModel):
    portfolio_return: float
    volatility: float
    sharpe_ratio: float
    var_95: float
    var_99: float
    assets: list[AssetMetrics]

class SectorExposure(BaseModel):
    sector: str
    weight: float

class SectorResponse(BaseModel):
    sectors: list[SectorExposure]
    concentrated: bool        # true if any sector > 50%
    top_sector: str
    top_sector_weight: float

class HistoricalDataPoint(BaseModel):
    date: str
    portfolio_value: float
    sp500_value: float

class HistoricalPerformance(BaseModel):
    data: list[HistoricalDataPoint]
    portfolio_total_return: float
    sp500_total_return: float