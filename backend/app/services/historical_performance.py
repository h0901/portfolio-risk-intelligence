import numpy as np
import yfinance as yf
import pandas as pd
from app.models.portfolio import MetricsRequest, HistoricalPerformance, HistoricalDataPoint


def compute_historical_performance(request: MetricsRequest) -> HistoricalPerformance:
    tickers  = [h.ticker for h in request.holdings]
    shares   = {h.ticker: h.shares for h in request.holdings}

    # --- 1. Fetch 1 year of prices for all tickers + S&P 500 ---
    all_tickers = tickers + ["SPY"]
    data = yf.download(
        tickers=all_tickers,
        period="1y",
        interval="1d",
        auto_adjust=True,
        progress=False,
    )

    prices = data["Close"].copy()
    prices = prices.ffill().dropna()

    valid_tickers = [t for t in tickers if t in prices.columns]

    if not valid_tickers:
        raise ValueError("Could not fetch historical data for any ticker.")

    # --- 2. Compute portfolio value over time ---
    # Start with initial shares * first available price
    portfolio_values = pd.Series(0.0, index=prices.index)
    for ticker in valid_tickers:
        portfolio_values += prices[ticker] * shares.get(ticker, 0)

    # --- 3. Normalize both to 100 at start ---
    portfolio_normalized = (portfolio_values / portfolio_values.iloc[0]) * 100
    sp500_normalized     = (prices["SPY"] / prices["SPY"].iloc[0]) * 100

    # --- 4. Build response — sample every 5 days to reduce payload size ---
    sampled = prices.index[::5]
    data_points = []
    for date in sampled:
        data_points.append(HistoricalDataPoint(
            date=date.strftime("%Y-%m-%d"),
            portfolio_value=round(float(portfolio_normalized[date]), 2),
            sp500_value=round(float(sp500_normalized[date]), 2),
        ))

    portfolio_total_return = round(float(portfolio_normalized.iloc[-1] - 100), 2)
    sp500_total_return     = round(float(sp500_normalized.iloc[-1] - 100), 2)

    return HistoricalPerformance(
        data=data_points,
        portfolio_total_return=portfolio_total_return,
        sp500_total_return=sp500_total_return,
    )