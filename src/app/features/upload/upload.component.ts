import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PortfolioService } from '../../core/services/portfolio.service';
import { ParsedPortfolio, Holding } from '../../core/models/portfolio.model';
import { HoldingInput } from '../../core/models/portfolio.model';
import Papa from 'papaparse';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="upload-page">

      <div class="page-header">
        <h1>Portfolio Upload</h1>
        <p class="subtitle">Upload a CSV file with your holdings to begin risk analysis.</p>
      </div>

      <!-- Format hint -->
      <mat-card class="hint-card">
        <mat-card-content>
          <p class="hint-label">Expected CSV format</p>
          <pre class="code-block">ticker,shares
AAPL,10
MSFT,5
NVDA,7</pre>
        </mat-card-content>
      </mat-card>

      <!-- Drop zone -->
      <div
        class="drop-zone"
        [class.drag-over]="isDragging"
        [class.has-file]="selectedFile"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave()"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <mat-icon class="drop-icon">{{ selectedFile ? 'check_circle' : 'upload_file' }}</mat-icon>
        <p class="drop-text">
          {{ selectedFile ? selectedFile.name : 'Drop your CSV here or click to browse' }}
        </p>
        <p class="drop-subtext" *ngIf="!selectedFile">Supports .csv files only</p>
        <input #fileInput type="file" accept=".csv" hidden (change)="onFileSelected($event)" />
      </div>

      <!-- Actions -->
      <div class="actions">
        <button mat-stroked-button (click)="loadSample()">
          <mat-icon>science</mat-icon> Use sample portfolio
        </button>
        <button
          mat-flat-button
          color="primary"
          [disabled]="!selectedFile || loading"
          (click)="upload()"
        >
          <mat-spinner *ngIf="loading" diameter="18" style="display:inline-block; margin-right:8px;"></mat-spinner>
          <mat-icon *ngIf="!loading">analytics</mat-icon>
          {{ loading ? 'Parsing...' : 'Parse Portfolio' }}
        </button>
      </div>

      <!-- Errors -->
      <div class="error-list" *ngIf="result?.errors?.length">
        <mat-icon color="warn">warning</mat-icon>
        <ul>
          <li *ngFor="let e of result!.errors">{{ e }}</li>
        </ul>
      </div>

      <!-- Results table -->
      <div *ngIf="result && result.holdings.length > 0">

        <div class="stats-row">
          <mat-card class="stat-card">
            <mat-card-content>
              <p class="stat-label">Holdings</p>
              <p class="stat-value">{{ result.holdings.length }}</p>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card">
            <mat-card-content>
              <p class="stat-label">Total Value</p>
              <p class="stat-value">\${{ result.total_value | number:'1.0-0' }}</p>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card">
            <mat-card-content>
              <p class="stat-label">Prices Found</p>
              <p class="stat-value">{{ knownCount }}/{{ result.holdings.length }}</p>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-card class="table-card">
          <mat-card-content>
            <table mat-table [dataSource]="result.holdings" class="holdings-table">

              <ng-container matColumnDef="ticker">
                <th mat-header-cell *matHeaderCellDef>Ticker</th>
                <td mat-cell *matCellDef="let h" class="mono">{{ h.ticker }}</td>
              </ng-container>

              <ng-container matColumnDef="shares">
                <th mat-header-cell *matHeaderCellDef>Shares</th>
                <td mat-cell *matCellDef="let h">{{ h.shares }}</td>
              </ng-container>

              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef>Price</th>
                <td mat-cell *matCellDef="let h">
                  {{ h.price ? ('$' + h.price) : '—' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="value">
                <th mat-header-cell *matHeaderCellDef>Value</th>
                <td mat-cell *matCellDef="let h">
                  {{ h.value ? ('$' + (h.value | number:'1.0-0')) : '—' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="weight">
                <th mat-header-cell *matHeaderCellDef>Weight</th>
                <td mat-cell *matCellDef="let h">
                  <div class="weight-cell">
                    <div class="weight-bar-bg">
                      <div class="weight-bar" [style.width.%]="h.weight || 0"></div>
                    </div>
                    <span>{{ h.weight ? (h.weight + '%') : '—' }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let h">
                  <mat-chip [class]="h.price ? 'chip-success' : 'chip-warn'">
                    {{ h.price ? 'recognized' : 'unknown' }}
                  </mat-chip>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>

        <div class="next-action">
         <button mat-flat-button color="primary" (click)="goToDashboard()">
            <mat-spinner *ngIf="loading" diameter="18" style="display:inline-block; margin-right:8px;"></mat-spinner>
            {{ loading ? 'Computing metrics...' : 'Continue to Dashboard' }}
            <mat-icon *ngIf="!loading">arrow_forward</mat-icon>
        </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .upload-page { max-width: 860px; margin: 0 auto; }

    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.8rem; font-weight: 600; margin: 0 0 4px; }
    .subtitle { color: #94a3b8; margin: 0; }

    .hint-card { background: #1e2433; border: 1px solid #2d3748; margin-bottom: 1.5rem; }
    .hint-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0 0 8px; }
    .code-block { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #a5f3fc; margin: 0; line-height: 1.6; }

    .drop-zone {
      border: 2px dashed #2d3748;
      border-radius: 12px;
      padding: 3rem 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 1rem;
    }
    .drop-zone:hover, .drop-zone.drag-over { border-color: #3b82f6; background: rgba(59,130,246,0.05); }
    .drop-zone.has-file { border-color: #22c55e; background: rgba(34,197,94,0.05); }
    .drop-icon { font-size: 40px; height: 40px; width: 40px; color: #64748b; margin-bottom: 12px; }
    .drop-text { font-size: 15px; font-weight: 500; margin: 0 0 4px; }
    .drop-subtext { font-size: 13px; color: #64748b; margin: 0; }

    .actions { display: flex; gap: 12px; margin-bottom: 1.5rem; }

    .error-list {
      display: flex; gap: 10px; align-items: flex-start;
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
      border-radius: 8px; padding: 12px 16px; margin-bottom: 1.5rem;
      color: #fca5a5;
    }
    .error-list ul { margin: 0; padding-left: 16px; font-size: 13px; }

    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 1.5rem; }
    .stat-card { background: #1e2433; border: 1px solid #2d3748; text-align: center; }
    .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0 0 4px; }
    .stat-value { font-size: 26px; font-weight: 600; margin: 0; }

    .table-card { background: #1e2433; border: 1px solid #2d3748; margin-bottom: 1.5rem; }
    .holdings-table { width: 100%; background: transparent; }
    .mono { font-family: 'IBM Plex Mono', monospace; font-weight: 500; }

    .weight-cell { display: flex; align-items: center; gap: 8px; }
    .weight-bar-bg { width: 80px; height: 6px; background: #2d3748; border-radius: 3px; }
    .weight-bar { height: 6px; background: #3b82f6; border-radius: 3px; transition: width 0.3s; }

    .chip-success { background: rgba(34,197,94,0.15) !important; color: #86efac !important; font-size: 11px !important; }
    .chip-warn { background: rgba(234,179,8,0.15) !important; color: #fde047 !important; font-size: 11px !important; }

    .next-action { display: flex; justify-content: flex-end; }
  `]
})
export class UploadComponent {
  selectedFile: File | null = null;
  loading = false;
  isDragging = false;
  result: ParsedPortfolio | null = null;
  displayedColumns = ['ticker', 'shares', 'price', 'value', 'weight', 'status'];

  get knownCount(): number {
    return this.result?.holdings.filter(h => h.price != null).length ?? 0;
  }

  constructor(
    private portfolioService: PortfolioService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragging = true; }
  onDragLeave() { this.isDragging = false; }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
    const file = e.dataTransfer?.files[0];
    if (file) this.setFile(file);
  }

  onFileSelected(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.setFile(file);
  }

  setFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      this.snackBar.open('Only .csv files are supported.', 'OK', { duration: 3000 });
      return;
    }
    this.selectedFile = file;
    this.result = null;
  }

  loadSample() {
    const csv = `ticker,shares\nAAPL,10\nMSFT,5\nNVDA,7\nTSLA,4\nAMZN,3\nGOOGL,6`;
    const blob = new Blob([csv], { type: 'text/csv' });
    this.selectedFile = new File([blob], 'sample_portfolio.csv', { type: 'text/csv' });
    this.result = null;
  }

  upload() {
    if (!this.selectedFile) return;
    this.loading = true;

    this.portfolioService.uploadPortfolio(this.selectedFile).subscribe({
      next: (portfolio) => {
        this.result = portfolio;
        this.portfolioService.setPortfolio(portfolio);

        const holdings = portfolio.holdings.map(h => ({
          ticker: h.ticker,
          shares: h.shares,
        }));

        this.portfolioService.computeMetrics(holdings).subscribe({
          next: (metrics) => {
            this.portfolioService.setMetrics(metrics);

            // Fire remaining 3 calls after metrics
            this.portfolioService.computeSectors(holdings).subscribe({
              next: (s) => this.portfolioService.setSectors(s)
            });

            this.portfolioService.computeHistorical(holdings).subscribe({
              next: (h) => this.portfolioService.setHistorical(h)
            });

            this.portfolioService.computeDistribution(holdings).subscribe({
              next: (d) => {
                this.portfolioService.setDistribution(d);
                this.loading = false;
              },
              error: () => { this.loading = false; }
            });
          },
          error: () => { this.loading = false; }
        });
      },
      error: (err) => {
        this.snackBar.open(err.error?.detail || 'Upload failed.', 'OK', { duration: 4000 });
        this.loading = false;
      }
    });
  }

  goToDashboard() {
    if (!this.result) return;
    this.portfolioService.setPortfolio(this.result);
    const holdings: HoldingInput[] = this.result.holdings.map(h => ({
        ticker: h.ticker,
        shares: h.shares,
    }));
    this.loading = true;
    this.portfolioService.computeMetrics(holdings).subscribe({
        next: (metrics) => {
        this.portfolioService.setMetrics(metrics);
        this.loading = false;
        this.router.navigate(['/dashboard']);
        },
        error: (err) => {
        this.snackBar.open('Failed to compute metrics.', 'OK', { duration: 4000 });
        this.loading = false;
        }
    });
  }
}