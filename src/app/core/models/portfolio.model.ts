export interface Holding {
  ticker: string;
  shares: number;
  price?: number;
  value?: number;
  weight?: number;
}

export interface ParsedPortfolio {
  holdings: Holding[];
  total_value: number;
  errors: string[];
}

export interface HoldingInput {
  ticker: string;
  shares: number;
}

export interface AssetMetrics {
  ticker: string;
  weight: number;
  annual_return: number;
  volatility: number;
  contribution_to_risk: number;
}

export interface RiskMetrics {
  portfolio_return: number;
  volatility: number;
  sharpe_ratio: number;
  var_95: number;
  var_99: number;
  assets: AssetMetrics[];
}

export interface SectorExposure {
  sector: string;
  weight: number;
}

export interface SectorResponse {
  sectors: SectorExposure[];
  concentrated: boolean;
  top_sector: string;
  top_sector_weight: number;
}

export interface HistoricalDataPoint {
  date: string;
  portfolio_value: number;
  sp500_value: number;
}

export interface HistoricalPerformance {
  data: HistoricalDataPoint[];
  portfolio_total_return: number;
  sp500_total_return: number;
}

export interface ReturnDistribution {
  daily_returns: number[];
  mean: number;
  std: number;
}