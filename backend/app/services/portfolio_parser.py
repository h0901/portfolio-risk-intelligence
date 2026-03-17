import io
import yfinance as yf
import pandas as pd
from app.models.portfolio import Holding, ParsedPortfolio


def fetch_prices(tickers: list[str]) -> dict[str, float]:
    """Fetch latest closing prices for a list of tickers from Yahoo Finance."""
    if not tickers:
        return {}

    prices = {}
    data = yf.download(
        tickers=tickers,
        period="1d",        # just the last trading day
        interval="1d",
        auto_adjust=True,
        progress=False,
    )

    # yfinance returns a MultiIndex DataFrame when multiple tickers are passed
    if len(tickers) == 1:
        ticker = tickers[0]
        if not data.empty:
            prices[ticker] = round(float(data["Close"].iloc[-1]), 2)
    else:
        for ticker in tickers:
            try:
                price = data["Close"][ticker].dropna().iloc[-1]
                prices[ticker] = round(float(price), 2)
            except (KeyError, IndexError):
                pass  # ticker not found or no data — will show as unknown

    return prices


def parse_portfolio_csv(contents: bytes) -> ParsedPortfolio:
    errors: list[str] = []
    holdings: list[Holding] = []

    # --- 1. Read CSV ---
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception:
        return ParsedPortfolio(
            holdings=[],
            total_value=0,
            errors=["Could not parse file. Make sure it is a valid CSV."]
        )

    # --- 2. Validate columns ---
    df.columns = df.columns.str.strip().str.lower()
    if "ticker" not in df.columns or "shares" not in df.columns:
        return ParsedPortfolio(
            holdings=[],
            total_value=0,
            errors=['CSV must have "ticker" and "shares" columns.']
        )

    # --- 3. Extract valid tickers and shares ---
    raw_holdings = []
    for i, row in df.iterrows():
        row_num = i + 2
        ticker = str(row["ticker"]).strip().upper()
        shares_raw = row["shares"]

        if not ticker or ticker == "NAN":
            errors.append(f"Row {row_num}: missing ticker, skipped.")
            continue

        try:
            shares = float(shares_raw)
            if shares <= 0:
                raise ValueError()
        except (ValueError, TypeError):
            errors.append(f"Row {row_num}: invalid shares for {ticker}, skipped.")
            continue

        raw_holdings.append((ticker, shares))

    if not raw_holdings:
        errors.append("No valid holdings found. Check your CSV format.")
        return ParsedPortfolio(holdings=[], total_value=0, errors=errors)

    # --- 4. Fetch live prices from Yahoo Finance ---
    tickers = [t for t, _ in raw_holdings]
    prices = fetch_prices(tickers)

    # --- 5. Build holdings list ---
    for ticker, shares in raw_holdings:
        price = prices.get(ticker)
        value = round(price * shares, 2) if price else None
        holdings.append(Holding(
            ticker=ticker,
            shares=shares,
            price=price,
            value=value,
        ))

    # --- 6. Calculate weights ---
    total_value = sum(h.value for h in holdings if h.value is not None)
    for h in holdings:
        if h.value and total_value > 0:
            h.weight = round((h.value / total_value) * 100, 2)

    return ParsedPortfolio(
        holdings=holdings,
        total_value=round(total_value, 2),
        errors=errors,
    )