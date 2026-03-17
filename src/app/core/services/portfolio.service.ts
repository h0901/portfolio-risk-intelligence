import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import {
  ParsedPortfolio, RiskMetrics, HoldingInput,
  SectorResponse, HistoricalPerformance, ReturnDistribution
} from '../models/portfolio.model';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private base = '/api';

  private portfolioSubject   = new BehaviorSubject<ParsedPortfolio | null>(null);
  private metricsSubject     = new BehaviorSubject<RiskMetrics | null>(null);
  private sectorsSubject     = new BehaviorSubject<SectorResponse | null>(null);
  private historicalSubject  = new BehaviorSubject<HistoricalPerformance | null>(null);
  private distributionSubject = new BehaviorSubject<ReturnDistribution | null>(null);

  portfolio$    = this.portfolioSubject.asObservable();
  metrics$      = this.metricsSubject.asObservable();
  sectors$      = this.sectorsSubject.asObservable();
  historical$   = this.historicalSubject.asObservable();
  distribution$ = this.distributionSubject.asObservable();

  constructor(private http: HttpClient) {}

  uploadPortfolio(file: File): Observable<ParsedPortfolio> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ParsedPortfolio>(`${this.base}/portfolio/upload`, form);
  }

  computeMetrics(holdings: HoldingInput[]): Observable<RiskMetrics> {
    return this.http.post<RiskMetrics>(`${this.base}/metrics/compute`, { holdings });
  }

  computeSectors(holdings: HoldingInput[]): Observable<SectorResponse> {
    return this.http.post<SectorResponse>(`${this.base}/metrics/sectors`, { holdings });
  }

  computeHistorical(holdings: HoldingInput[]): Observable<HistoricalPerformance> {
    return this.http.post<HistoricalPerformance>(`${this.base}/metrics/historical`, { holdings });
  }

  computeDistribution(holdings: HoldingInput[]): Observable<ReturnDistribution> {
    return this.http.post<ReturnDistribution>(`${this.base}/metrics/distribution`, { holdings });
  }

  setPortfolio(p: ParsedPortfolio)        { this.portfolioSubject.next(p); }
  setMetrics(m: RiskMetrics)              { this.metricsSubject.next(m); }
  setSectors(s: SectorResponse)           { this.sectorsSubject.next(s); }
  setHistorical(h: HistoricalPerformance) { this.historicalSubject.next(h); }
  setDistribution(d: ReturnDistribution)  { this.distributionSubject.next(d); }

  getPortfolio()    { return this.portfolioSubject.value; }
  getMetrics()      { return this.metricsSubject.value; }
  getSectors()      { return this.sectorsSubject.value; }
  getHistorical()   { return this.historicalSubject.value; }
  getDistribution() { return this.distributionSubject.value; }
}