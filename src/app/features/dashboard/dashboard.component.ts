import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Chart, registerables } from 'chart.js';
import { PortfolioService } from '../../core/services/portfolio.service';
import { HistoricalPerformance, ReturnDistribution, RiskMetrics, SectorResponse } from '../../core/models/portfolio.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
  ],
  template: `
    <div class="dashboard">

      <div class="page-header">
        <div>
          <h1>Risk Dashboard</h1>
          <p class="subtitle">Portfolio analytics based on 1 year of market data.</p>
        </div>
        <button mat-stroked-button (click)="back()">
          <mat-icon>arrow_back</mat-icon> Upload New
        </button>
      </div>

      <div *ngIf="!metrics" class="empty-state">
        <mat-icon>analytics</mat-icon>
        <p>No portfolio data found.</p>
        <button mat-flat-button color="primary" (click)="back()">Upload a Portfolio</button>
      </div>

      <div *ngIf="metrics">

        <!-- Concentration warning -->
        <div *ngIf="sectors?.concentrated" class="warning-banner">
          <mat-icon>warning</mat-icon>
          <span>
            High sector concentration — <strong>{{ sectors?.top_sector }}</strong>
            makes up {{ sectors?.top_sector_weight }}% of your portfolio.
            Consider diversifying into other sectors.
          </span>
        </div>

        <!-- Metric cards -->
        <div class="metrics-grid">
          <mat-card class="metric-card">
            <mat-card-content>
              <p class="metric-label">Annual Return</p>
              <p class="metric-value" [class.positive]="metrics.portfolio_return > 0" [class.negative]="metrics.portfolio_return < 0">
                {{ metrics.portfolio_return > 0 ? '+' : '' }}{{ metrics.portfolio_return }}%
              </p>
              <p class="metric-hint">Past 12 months</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="metric-card">
            <mat-card-content>
              <p class="metric-label">Volatility</p>
              <p class="metric-value" [class.warn]="metrics.volatility > 25">
                {{ metrics.volatility }}%
              </p>
              <p class="metric-hint">Annualized std deviation</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="metric-card">
            <mat-card-content>
              <p class="metric-label">Sharpe Ratio</p>
              <p class="metric-value" [class.positive]="metrics.sharpe_ratio > 1">
                {{ metrics.sharpe_ratio }}
              </p>
              <p class="metric-hint">{{ metrics.sharpe_ratio > 1 ? 'Good risk/return' : 'Below average' }}</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="metric-card">
            <mat-card-content>
              <p class="metric-label">VaR (95%)</p>
              <p class="metric-value negative">{{ metrics.var_95 }}%</p>
              <p class="metric-hint">Daily downside risk</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="metric-card">
            <mat-card-content>
              <p class="metric-label">VaR (99%)</p>
              <p class="metric-value negative">{{ metrics.var_99 }}%</p>
              <p class="metric-hint">Extreme daily downside</p>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Charts row 1: allocation + sector -->
        <div class="charts-row">
          <mat-card class="chart-card">
            <mat-card-content>
              <p class="chart-title">Portfolio Allocation</p>
              <div class="chart-container">
                <canvas #allocationChart></canvas>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-content>
              <p class="chart-title">Sector Exposure</p>
              <div class="chart-container">
                <canvas #sectorChart></canvas>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Charts row 2: risk contribution + volatility -->
        <div class="charts-row">
          <mat-card class="chart-card">
            <mat-card-content>
              <p class="chart-title">Risk Contribution by Asset</p>
              <div class="chart-container">
                <canvas #riskChart></canvas>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-content>
              <p class="chart-title">Volatility by Asset</p>
              <div class="chart-container">
                <canvas #volatilityChart></canvas>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Historical performance -->
          <mat-card class="chart-card-full">
            <mat-card-content>
              <div class="chart-header-row">
                <p class="chart-title">Portfolio vs S&P 500 (1 Year)</p>
                <div class="return-badges" *ngIf="historical">
                  <span class="return-badge"
                    [class.badge-positive]="historical.portfolio_total_return > 0"
                    [class.badge-negative]="historical.portfolio_total_return < 0">
                    Portfolio {{ historical.portfolio_total_return > 0 ? '+' : '' }}{{ historical.portfolio_total_return }}%
                  </span>
                  <span class="return-badge"
                    [class.badge-positive]="historical.sp500_total_return > 0"
                    [class.badge-negative]="historical.sp500_total_return < 0">
                    S&P 500 {{ historical.sp500_total_return > 0 ? '+' : '' }}{{ historical.sp500_total_return }}%
                  </span>
                </div>
              </div>
              <div class="chart-container-wide">
                <canvas #historicalChart></canvas>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Return distribution -->
          <mat-card class="chart-card-full">
            <mat-card-content>
              <div class="chart-header-row">
                <p class="chart-title">Daily Return Distribution</p>
                <div class="return-badges" *ngIf="distribution">
                  <span class="return-badge">Mean {{ distribution.mean }}%</span>
                  <span class="return-badge">Std {{ distribution.std }}%</span>
                </div>
              </div>
              <div class="chart-container-wide">
                <canvas #distributionChart></canvas>
              </div>
            </mat-card-content>
          </mat-card>

        <!-- Asset table -->
        <mat-card class="table-card">
          <mat-card-content>
            <p class="chart-title">Asset Breakdown</p>
            <table mat-table [dataSource]="metrics.assets" class="asset-table">

              <ng-container matColumnDef="ticker">
                <th mat-header-cell *matHeaderCellDef>Ticker</th>
                <td mat-cell *matCellDef="let a" class="mono bold">{{ a.ticker }}</td>
              </ng-container>

              <ng-container matColumnDef="weight">
                <th mat-header-cell *matHeaderCellDef>Weight</th>
                <td mat-cell *matCellDef="let a">{{ a.weight }}%</td>
              </ng-container>

              <ng-container matColumnDef="annual_return">
                <th mat-header-cell *matHeaderCellDef>Annual Return</th>
                <td mat-cell *matCellDef="let a"
                  [class.positive]="a.annual_return > 0"
                  [class.negative]="a.annual_return < 0">
                  {{ a.annual_return > 0 ? '+' : '' }}{{ a.annual_return }}%
                </td>
              </ng-container>

              <ng-container matColumnDef="volatility">
                <th mat-header-cell *matHeaderCellDef>Volatility</th>
                <td mat-cell *matCellDef="let a" [class.warn]="a.volatility > 40">
                  {{ a.volatility }}%
                </td>
              </ng-container>

              <ng-container matColumnDef="contribution">
                <th mat-header-cell *matHeaderCellDef>Risk Contribution</th>
                <td mat-cell *matCellDef="let a">
                  <div class="contrib-cell">
                    <div class="contrib-bar-bg">
                      <div class="contrib-bar"
                        [style.width.%]="(a.contribution_to_risk / maxContribution) * 100">
                      </div>
                    </div>
                    <span>{{ a.contribution_to_risk }}%</span>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>

        <div class="next-action">
          <button mat-flat-button color="primary" (click)="goToChat()">
            Ask the AI Analyst <mat-icon>smart_toy</mat-icon>
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1100px; margin: 0 auto; }

    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    .page-header h1 { font-size: 1.8rem; font-weight: 600; margin: 0 0 4px; }
    .subtitle { color: #94a3b8; margin: 0; font-size: 14px; }

    .empty-state { text-align: center; padding: 4rem; color: #64748b; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; margin-bottom: 1rem; }

    .warning-banner {
      display: flex; align-items: center; gap: 10px;
      background: rgba(245,158,11,0.1);
      border: 1px solid rgba(245,158,11,0.3);
      border-radius: 8px; padding: 12px 16px;
      color: #fcd34d; font-size: 14px;
      margin-bottom: 1.5rem;
    }
    .warning-banner mat-icon { color: #f59e0b; }

    .metrics-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 1.5rem; }
    .metric-card { background: #1a1f2e !important; border: 1px solid #2d3748 !important; }
    .metric-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0 0 6px; }
    .metric-value { font-size: 24px; font-weight: 600; margin: 0 0 4px; }
    .metric-hint { font-size: 11px; color: #475569; margin: 0; }

    .positive { color: #22c55e !important; }
    .negative { color: #ef4444 !important; }
    .warn     { color: #f59e0b !important; }
    .bold     { font-weight: 600; }

    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
    .chart-card { background: #1a1f2e !important; border: 1px solid #2d3748 !important; }
    .chart-title { font-size: 13px; font-weight: 500; color: #94a3b8; margin: 0 0 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .chart-container { position: relative; height: 260px; }

    .table-card { background: #1a1f2e !important; border: 1px solid #2d3748 !important; margin-bottom: 1.5rem; }
    .asset-table { width: 100%; background: transparent !important; }
    .mono { font-family: 'IBM Plex Mono', monospace; }

    .contrib-cell { display: flex; align-items: center; gap: 10px; }
    .contrib-bar-bg { width: 100px; height: 6px; background: #2d3748; border-radius: 3px; }
    .contrib-bar { height: 6px; background: #ef4444; border-radius: 3px; transition: width 0.4s; }

    .next-action { display: flex; justify-content: flex-end; margin-top: 1rem; }

    .chart-card-full { background: #1a1f2e !important; border: 1px solid #2d3748 !important; margin-bottom: 1.5rem; }
    .chart-container-wide { position: relative; height: 220px; }
    .chart-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .return-badges { display: flex; gap: 8px; }
    .return-badge { font-size: 12px; padding: 4px 10px; border-radius: 20px; background: #2d3748; color: #94a3b8; }
    .badge-positive { background: rgba(34,197,94,0.15) !important; color: #86efac !important; }
    .badge-negative { background: rgba(239,68,68,0.15) !important; color: #fca5a5 !important; }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('allocationChart') allocationRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('riskChart')       riskRef!:       ElementRef<HTMLCanvasElement>;
  @ViewChild('volatilityChart') volatilityRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sectorChart')     sectorRef!:     ElementRef<HTMLCanvasElement>;
  @ViewChild('historicalChart')   historicalRef!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('distributionChart') distributionRef!: ElementRef<HTMLCanvasElement>;

  metrics: RiskMetrics | null = null;
  sectors: SectorResponse | null = null;
  historical: HistoricalPerformance | null = null;
  distribution: ReturnDistribution | null = null;
  displayedColumns = ['ticker', 'weight', 'annual_return', 'volatility', 'contribution'];
  private charts: Chart[] = [];

  get maxContribution(): number {
    return Math.max(...(this.metrics?.assets.map(a => a.contribution_to_risk) ?? [1]));
  }

  constructor(private portfolioService: PortfolioService, private router: Router) {}

  ngOnInit() {
    this.metrics      = this.portfolioService.getMetrics();
    this.sectors      = this.portfolioService.getSectors();
    this.historical   = this.portfolioService.getHistorical();
    this.distribution = this.portfolioService.getDistribution();
  }

  ngAfterViewInit() {
    if (this.metrics) setTimeout(() => this.buildCharts(), 100);
  }

  ngOnDestroy() {
    this.charts.forEach(c => c.destroy());
  }

  buildCharts() {
    if (!this.metrics) return;
    const assets = this.metrics.assets;

    const COLORS = [
      '#3b82f6', '#22c55e', '#f59e0b', '#ef4444',
      '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'
    ];

    // --- Allocation donut ---
    this.charts.push(new Chart(this.allocationRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: assets.map(a => a.ticker),
        datasets: [{
          data: assets.map(a => a.weight),
          backgroundColor: COLORS,
          borderColor: '#0f1117',
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 12 }, padding: 12 } },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%` } }
        }
      }
    }));

    // --- Sector donut ---
    if (this.sectors) {
      const sectorColors = [
        '#3b82f6', '#f59e0b', '#22c55e', '#ef4444',
        '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#94a3b8'
      ];
      this.charts.push(new Chart(this.sectorRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: this.sectors.sectors.map(s => s.sector),
          datasets: [{
            data: this.sectors.sectors.map(s => s.weight),
            backgroundColor: sectorColors,
            borderColor: '#0f1117',
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 12 }, padding: 12 } },
            tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%` } }
          }
        }
      }));
    }

    // --- Risk contribution bar ---
    const sortedByRisk = [...assets].sort((a, b) => b.contribution_to_risk - a.contribution_to_risk);
    this.charts.push(new Chart(this.riskRef.nativeElement, {
      type: 'bar',
      data: {
        labels: sortedByRisk.map(a => a.ticker),
        datasets: [{
          label: 'Risk Contribution %',
          data: sortedByRisk.map(a => a.contribution_to_risk),
          backgroundColor: COLORS,
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e2433' } },
          y: { ticks: { color: '#94a3b8', callback: (v) => v + '%' }, grid: { color: '#1e2433' } }
        }
      }
    }));

    // --- Volatility horizontal bar ---
    const sortedByVol = [...assets].sort((a, b) => b.volatility - a.volatility);
    this.charts.push(new Chart(this.volatilityRef.nativeElement, {
      type: 'bar',
      data: {
        labels: sortedByVol.map(a => a.ticker),
        datasets: [{
          label: 'Annualized Volatility %',
          data: sortedByVol.map(a => a.volatility),
          backgroundColor: sortedByVol.map(a =>
            a.volatility > 50 ? '#ef4444' :
            a.volatility > 30 ? '#f59e0b' : '#22c55e'
          ),
          borderRadius: 4,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#94a3b8', callback: (v) => v + '%' }, grid: { color: '#1e2433' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e2433' } }
        }
      }
    }));
        // --- Historical performance line chart ---
    if (this.historical) {
      this.charts.push(new Chart(this.historicalRef.nativeElement, {
        type: 'line',
        data: {
          labels: this.historical.data.map(d => d.date),
          datasets: [
            {
              label: 'My Portfolio',
              data: this.historical.data.map(d => d.portfolio_value),
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59,130,246,0.08)',
              borderWidth: 2,
              pointRadius: 0,
              fill: true,
              tension: 0.3,
            },
            {
              label: 'S&P 500',
              data: this.historical.data.map(d => d.sp500_value),
              borderColor: '#94a3b8',
              backgroundColor: 'rgba(148,163,184,0.04)',
              borderWidth: 1.5,
              pointRadius: 0,
              fill: true,
              tension: 0.3,
              borderDash: [4, 4],
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { labels: { color: '#94a3b8', font: { size: 12 } } },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y?.toFixed(1) ?? 'N/A'} (base 100)`
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#64748b',
                maxTicksLimit: 8,
                font: { size: 11 }
              },
              grid: { color: '#1e2433' }
            },
            y: {
              ticks: { color: '#94a3b8', callback: (v) => v },
              grid: { color: '#1e2433' }
            }
          }
        }
      }));
    }

    // --- Return distribution histogram ---
    if (this.distribution) {
      const returns = this.distribution.daily_returns;

      // Build histogram bins
      const min   = Math.min(...returns);
      const max   = Math.max(...returns);
      const bins  = 30;
      const step  = (max - min) / bins;
      const counts = new Array(bins).fill(0);
      const labels: string[] = [];

      for (let i = 0; i < bins; i++) {
        labels.push((min + i * step).toFixed(2) + '%');
      }
      for (const r of returns) {
        const idx = Math.min(Math.floor((r - min) / step), bins - 1);
        counts[idx]++;
      }

      this.charts.push(new Chart(this.distributionRef.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Days',
            data: counts,
            backgroundColor: counts.map((_, i) => {
              const val = min + i * step;
              return val < 0 ? 'rgba(239,68,68,0.6)' : 'rgba(34,197,94,0.6)';
            }),
            borderRadius: 2,
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.parsed.y} trading days`,
                title: (items) => `Return: ${items[0].label}`
              }
            }
          },
          scales: {
            x: {
              ticks: { color: '#64748b', maxTicksLimit: 8, font: { size: 11 } },
              grid: { color: '#1e2433' }
            },
            y: {
              ticks: { color: '#94a3b8' },
              grid: { color: '#1e2433' }
            }
          }
        }
      }));
    }
  }

  back()     { this.router.navigate(['/']); }
  goToChat() { this.router.navigate(['/chat']); }
}