import numpy as np
import yfinance as yf
import pandas as pd
from app.models.portfolio import MetricsRequest, RiskMetrics, AssetMetrics


RISK_FREE_RATE = 0.05  # 5% annualized — approximate current T-bill rate


def fetch_historical_prices(tickers: list[str], period: str = "1y") -> pd.DataFrame:
    """
    Fetch 1 year of daily closing prices for all tickers.
    Returns a DataFrame where each column is a ticker.
    """
    data = yf.download(
        tickers=tickers,
        period=period,
        interval="1d",
        auto_adjust=True,
        progress=False,
    )

    if len(tickers) == 1:
        prices = data[["Close"]].copy()
        prices.columns = tickers
    else:
        prices = data["Close"].copy()

    # Drop any columns (tickers) with too many missing values
    prices = prices.dropna(axis=1, thresh=int(len(prices) * 0.8))
    prices = prices.ffill()  # forward fill any remaining gaps

    return prices


def compute_risk_metrics(request: MetricsRequest) -> RiskMetrics:
    tickers = [h.ticker for h in request.holdings]
    shares  = {h.ticker: h.shares for h in request.holdings}

    # --- 1. Fetch historical prices ---
    prices = fetch_historical_prices(tickers)

    # Keep only tickers we actually got data for
    valid_tickers = [t for t in tickers if t in prices.columns]

    if not valid_tickers:
        raise ValueError("Could not fetch price data for any of the provided tickers.")

    # --- 2. Compute daily returns ---
    # pct_change() gives us: (price_today - price_yesterday) / price_yesterday
    daily_returns = prices[valid_tickers].pct_change().dropna()

    # --- 3. Compute portfolio weights by current market value ---
    latest_prices = prices[valid_tickers].iloc[-1]
    market_values = {t: latest_prices[t] * shares[t] for t in valid_tickers}
    total_value   = sum(market_values.values())
    weights       = np.array([market_values[t] / total_value for t in valid_tickers])

    # --- 4. Portfolio daily returns ---
    # Weighted sum of each asset's daily return
    portfolio_daily_returns = daily_returns[valid_tickers].values @ weights

    # --- 5. Annualized return ---
    # Trading days in a year = 252
    mean_daily_return      = np.mean(portfolio_daily_returns)
    annualized_return      = mean_daily_return * 252

    # --- 6. Annualized volatility ---
    daily_vol       = np.std(portfolio_daily_returns, ddof=1)
    annualized_vol  = daily_vol * np.sqrt(252)

    # --- 7. Sharpe Ratio ---
    # (Portfolio Return - Risk Free Rate) / Volatility
    sharpe = (annualized_return - RISK_FREE_RATE) / annualized_vol if annualized_vol > 0 else 0.0

    # --- 8. Value at Risk (Historical Simulation) ---
    # Sort portfolio daily returns and find the worst 5% and 1% days
    var_95 = float(np.percentile(portfolio_daily_returns, 5))   # 95% confidence
    var_99 = float(np.percentile(portfolio_daily_returns, 1))   # 99% confidence

    # --- 9. Per-asset metrics ---
    assets = []
    cov_matrix = daily_returns[valid_tickers].cov() * 252  # annualized covariance

    for i, ticker in enumerate(valid_tickers):
        asset_return    = float(daily_returns[ticker].mean() * 252)
        asset_vol       = float(daily_returns[ticker].std(ddof=1) * np.sqrt(252))

        # Marginal contribution to portfolio risk
        # = weight * (covariance of asset with portfolio) / portfolio volatility
        cov_with_portfolio = float(cov_matrix.iloc[i].values @ weights)
        contribution       = float(weights[i] * cov_with_portfolio / annualized_vol) if annualized_vol > 0 else 0.0

        assets.append(AssetMetrics(
            ticker=ticker,
            weight=round(weights[i] * 100, 2),
            annual_return=round(asset_return * 100, 2),
            volatility=round(asset_vol * 100, 2),
            contribution_to_risk=round(contribution * 100, 2),
        ))

    # Sort by contribution to risk descending
    assets.sort(key=lambda a: a.contribution_to_risk, reverse=True)

    # Pass real weights to sector mapper
    holdings_with_weights = [
        {"ticker": t, "weight": float(weights[i] * 100)}
        for i, t in enumerate(valid_tickers)
    ]

    return RiskMetrics(
        portfolio_return=round(annualized_return * 100, 2),
        volatility=round(annualized_vol * 100, 2),
        sharpe_ratio=round(sharpe, 2),
        var_95=round(var_95 * 100, 2),
        var_99=round(var_99 * 100, 2),
        assets=assets,
    )

def compute_return_distribution(request: MetricsRequest) -> dict:
    """Returns daily return data for histogram visualization."""
    tickers = [h.ticker for h in request.holdings]
    shares  = {h.ticker: h.shares for h in request.holdings}

    prices = fetch_historical_prices(tickers)
    valid_tickers = [t for t in tickers if t in prices.columns]

    daily_returns = prices[valid_tickers].pct_change().dropna()

    latest_prices  = prices[valid_tickers].iloc[-1]
    market_values  = {t: latest_prices[t] * shares[t] for t in valid_tickers}
    total_value    = sum(market_values.values())
    weights        = np.array([market_values[t] / total_value for t in valid_tickers])

    portfolio_daily_returns = (daily_returns[valid_tickers].values @ weights).tolist()

    return {
        "daily_returns": [round(r * 100, 4) for r in portfolio_daily_returns],
        "mean": round(float(np.mean(portfolio_daily_returns)) * 100, 4),
        "std": round(float(np.std(portfolio_daily_returns)) * 100, 4),
    }