DOCUMENTS = [
    {
        "id": "div_001",
        "title": "Portfolio Diversification Theory",
        "content": """
        Portfolio diversification is the practice of spreading investments across different assets
        to reduce risk. Modern Portfolio Theory (MPT), developed by Harry Markowitz in 1952,
        demonstrates that diversification can reduce portfolio volatility without sacrificing returns.
        A well-diversified portfolio combines assets with low or negative correlations.
        When one asset falls, others may rise or remain stable, reducing overall portfolio swings.
        Concentration risk occurs when a portfolio holds too much of a single stock, sector, or asset class.
        For example, a portfolio with 60% or more in technology stocks is considered highly concentrated
        and exposes the investor to sector-specific downturns.
        """
    },
    {
        "id": "vol_001",
        "title": "Understanding Portfolio Volatility",
        "content": """
        Volatility measures how much a portfolio's returns deviate from its average over time.
        It is expressed as annualized standard deviation of daily returns.
        Low volatility (under 15%) indicates a stable portfolio, typically bonds or large-cap value stocks.
        Moderate volatility (15-25%) is typical for a balanced equity portfolio.
        High volatility (above 25%) suggests aggressive growth stocks or concentrated positions.
        Volatility is not inherently bad — it reflects the potential for higher returns.
        However, high volatility increases the chance of significant drawdowns during market stress.
        Technology stocks historically show higher volatility than consumer staples or utilities.
        """
    },
    {
        "id": "sharpe_001",
        "title": "Sharpe Ratio and Risk-Adjusted Returns",
        "content": """
        The Sharpe Ratio measures the return earned per unit of risk taken.
        It is calculated as (Portfolio Return - Risk Free Rate) / Portfolio Volatility.
        A Sharpe Ratio below 0 means the portfolio underperforms a risk-free asset like Treasury bills.
        A ratio between 0 and 1 means some compensation for risk but below average efficiency.
        A ratio above 1 is considered good — the portfolio generates more than one unit of return per unit of risk.
        A ratio above 2 is very good, above 3 is exceptional.
        Investors should compare Sharpe Ratios across similar portfolios to assess relative performance.
        A high Sharpe Ratio with low volatility is the ideal combination for long-term wealth building.
        """
    },
    {
        "id": "var_001",
        "title": "Value at Risk Explained",
        "content": """
        Value at Risk (VaR) estimates the maximum potential loss of a portfolio over a given time period
        at a specified confidence level. A 95% VaR of -2.5% means there is a 5% chance the portfolio
        could lose more than 2.5% in a single day. A 99% VaR of -4% means a 1% chance of losing more
        than 4% in a day. Historical simulation VaR uses actual past returns to estimate future risk.
        VaR does not capture tail risk beyond the confidence threshold — extreme events like market crashes
        can exceed VaR estimates significantly. VaR should be used alongside other metrics like
        Conditional VaR (CVaR) and stress testing for a complete risk picture.
        """
    },
    {
        "id": "tech_001",
        "title": "Technology Sector Risk Profile",
        "content": """
        Technology stocks are classified as high-growth, high-risk investments.
        The sector is highly sensitive to interest rate changes — rising rates reduce the present value
        of future earnings, which disproportionately affects high-growth tech companies.
        Technology stocks typically have beta values above 1.0, meaning they amplify market movements.
        During bull markets, tech outperforms significantly. During corrections, drawdowns are steeper.
        Concentration in a single sector like technology increases correlation risk — when the sector falls,
        all holdings fall together, eliminating diversification benefits.
        Notable tech volatility events include the dot-com crash (2000-2002), the 2022 rate hike selloff,
        and individual stock events like earnings misses or regulatory actions.
        """
    },
    {
        "id": "risk_contrib_001",
        "title": "Risk Contribution and Marginal Risk",
        "content": """
        Risk contribution measures how much each individual asset adds to total portfolio volatility.
        An asset with a high risk contribution is driving most of the portfolio's swings.
        Risk contribution depends on both the asset's weight and its correlation with other holdings.
        A small position in a highly volatile, highly correlated stock can contribute more risk
        than a large position in a stable, uncorrelated asset.
        To reduce a specific asset's risk contribution, investors can reduce its weight,
        add negatively correlated assets, or replace it with a lower-volatility alternative in the same sector.
        Risk parity is a strategy that allocates capital so each asset contributes equally to portfolio risk.
        """
    },
    {
        "id": "rebalance_001",
        "title": "Portfolio Rebalancing Strategies",
        "content": """
        Rebalancing restores a portfolio to its target asset allocation after market movements shift weights.
        When one asset grows significantly, it increases concentration risk and may cause the portfolio
        to drift from its intended risk profile.
        Common rebalancing strategies include calendar rebalancing (monthly, quarterly, annually)
        and threshold rebalancing (rebalance when any asset drifts more than 5% from target weight).
        Tax implications of rebalancing should be considered — selling appreciated assets triggers capital gains.
        In tax-advantaged accounts, rebalancing is more straightforward and can be done more frequently.
        Regular rebalancing has been shown to improve risk-adjusted returns over long time horizons.
        """
    },
    {
        "id": "macro_001",
        "title": "Macroeconomic Factors and Portfolio Risk",
        "content": """
        Macroeconomic conditions significantly influence portfolio risk and returns.
        Interest rate rises increase borrowing costs, reduce consumer spending, and compress equity valuations,
        particularly for growth stocks and technology companies.
        Inflation erodes the real value of fixed income investments and squeezes corporate profit margins.
        Recession fears increase market volatility and correlation across asset classes — assets that
        normally move independently tend to fall together during systemic crises.
        Geographic diversification — holding international equities — can reduce exposure to single-country
        macroeconomic risks. Adding defensive sectors like healthcare, utilities, and consumer staples
        provides a buffer during economic downturns.
        """
    },
    {
        "id": "sector_001",
        "title": "Sector Diversification and Correlation",
        "content": """
        Sector diversification involves spreading investments across different industries to reduce
        the impact of sector-specific downturns. The major S&P 500 sectors include Technology,
        Healthcare, Financials, Consumer Discretionary, Consumer Staples, Energy, Utilities,
        Materials, Industrials, Real Estate, and Communication Services.
        Technology and Communication Services are highly correlated — both are sensitive to interest rates
        and earnings growth expectations.
        Defensive sectors like Healthcare, Utilities, and Consumer Staples have low correlation with
        the broader market and provide stability during downturns.
        A portfolio concentrated in cyclical sectors — Technology, Consumer Discretionary, Energy —
        will experience amplified gains and losses relative to the broader market.
        """
    },
    {
        "id": "tsla_001",
        "title": "High Volatility Individual Stocks",
        "content": """
        Individual stocks with very high volatility, such as Tesla (TSLA), can disproportionately
        affect portfolio risk even at modest position sizes.
        Tesla has historically exhibited annualized volatility exceeding 50-70%, far above the S&P 500's
        typical 15-20% volatility. This means a 15-20% position in Tesla can contribute as much risk
        as the rest of a diversified portfolio combined.
        High volatility stocks are sensitive to earnings surprises, executive statements, regulatory news,
        and broader market sentiment shifts.
        Investors holding high-volatility individual stocks should consider position sizing carefully —
        limiting such positions to 5-10% of the portfolio to contain their risk contribution.
        """
    },
]