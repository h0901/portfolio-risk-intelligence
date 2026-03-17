# Static sector mapping — covers most common tickers
# Can be extended with any ticker
SECTOR_MAP: dict[str, str] = {
    # Technology
    "AAPL":  "Technology",
    "MSFT":  "Technology",
    "NVDA":  "Technology",
    "GOOGL": "Technology",
    "GOOG":  "Technology",
    "META":  "Technology",
    "AVGO":  "Technology",
    "ORCL":  "Technology",
    "ADBE":  "Technology",
    "CRM":   "Technology",
    "AMD":   "Technology",
    "INTC":  "Technology",
    "QCOM":  "Technology",
    "TXN":   "Technology",
    "IBM":   "Technology",

    # Consumer Discretionary
    "AMZN":  "Consumer Discretionary",
    "TSLA":  "Consumer Discretionary",
    "HD":    "Consumer Discretionary",
    "MCD":   "Consumer Discretionary",
    "NKE":   "Consumer Discretionary",
    "SBUX":  "Consumer Discretionary",
    "TGT":   "Consumer Discretionary",
    "LOW":   "Consumer Discretionary",

    # Communication Services
    "NFLX":  "Communication Services",
    "DIS":   "Communication Services",
    "CMCSA": "Communication Services",
    "T":     "Communication Services",
    "VZ":    "Communication Services",
    "TMUS":  "Communication Services",

    # Financials
    "JPM":   "Financials",
    "BAC":   "Financials",
    "WFC":   "Financials",
    "GS":    "Financials",
    "MS":    "Financials",
    "BLK":   "Financials",
    "C":     "Financials",
    "AXP":   "Financials",
    "V":     "Financials",
    "MA":    "Financials",

    # Healthcare
    "JNJ":   "Healthcare",
    "UNH":   "Healthcare",
    "PFE":   "Healthcare",
    "ABBV":  "Healthcare",
    "MRK":   "Healthcare",
    "TMO":   "Healthcare",
    "ABT":   "Healthcare",
    "LLY":   "Healthcare",
    "DHR":   "Healthcare",
    "BMY":   "Healthcare",

    # Consumer Staples
    "PG":    "Consumer Staples",
    "KO":    "Consumer Staples",
    "PEP":   "Consumer Staples",
    "WMT":   "Consumer Staples",
    "COST":  "Consumer Staples",
    "CL":    "Consumer Staples",
    "MDLZ":  "Consumer Staples",

    # Energy
    "XOM":   "Energy",
    "CVX":   "Energy",
    "COP":   "Energy",
    "SLB":   "Energy",
    "EOG":   "Energy",
    "PSX":   "Energy",
    "MPC":   "Energy",

    # Industrials
    "BA":    "Industrials",
    "CAT":   "Industrials",
    "GE":    "Industrials",
    "MMM":   "Industrials",
    "HON":   "Industrials",
    "UPS":   "Industrials",
    "RTX":   "Industrials",
    "LMT":   "Industrials",

    # Utilities
    "NEE":   "Utilities",
    "DUK":   "Utilities",
    "SO":    "Utilities",
    "D":     "Utilities",
    "AEP":   "Utilities",

    # Real Estate
    "AMT":   "Real Estate",
    "PLD":   "Real Estate",
    "CCI":   "Real Estate",
    "EQIX":  "Real Estate",
    "SPG":   "Real Estate",

    # Materials
    "LIN":   "Materials",
    "APD":   "Materials",
    "ECL":   "Materials",
    "NEM":   "Materials",
    "FCX":   "Materials",
}

def get_sector(ticker: str) -> str:
    return SECTOR_MAP.get(ticker.upper(), "Other")

def get_sector_exposure(holdings: list[dict]) -> list[dict]:
    """
    Given a list of holdings with ticker and weight,
    returns sector breakdown sorted by weight descending.
    """
    sector_weights: dict[str, float] = {}

    for h in holdings:
        sector = get_sector(h["ticker"])
        sector_weights[sector] = round(
            sector_weights.get(sector, 0) + h["weight"], 2
        )

    # Sort by weight descending
    sorted_sectors = sorted(
        [{"sector": k, "weight": v} for k, v in sector_weights.items()],
        key=lambda x: x["weight"],
        reverse=True,
    )

    return sorted_sectors