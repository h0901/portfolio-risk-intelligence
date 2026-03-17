import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PortfolioService } from '../../core/services/portfolio.service';
import { RiskMetrics } from '../../core/models/portfolio.model';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  sources?: string[];
  loading?: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  template: `
    <div class="chat-page">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>AI Risk Analyst</h1>
          <p class="subtitle">Ask anything about your portfolio risk.</p>
        </div>
        <button mat-stroked-button (click)="back()">
          <mat-icon>arrow_back</mat-icon> Dashboard
        </button>
      </div>

      <!-- No portfolio warning -->
      <div *ngIf="!metrics" class="empty-state">
        <mat-icon>warning</mat-icon>
        <p>No portfolio loaded. Upload a portfolio first.</p>
        <button mat-flat-button color="primary" (click)="goToUpload()">Upload Portfolio</button>
      </div>

      <div *ngIf="metrics" class="chat-layout">

        <!-- Suggested questions -->
        <div class="suggestions" *ngIf="messages.length === 0">
          <p class="suggestions-label">Suggested questions</p>
          <div class="suggestion-chips">
            <button
              *ngFor="let q of suggestedQuestions"
              mat-stroked-button
              class="suggestion-btn"
              (click)="askSuggestion(q)"
            >{{ q }}</button>
          </div>
        </div>

        <!-- Messages -->
        <div class="messages-container" #messagesContainer>
          <div *ngFor="let msg of messages" class="message-row" [class.user-row]="msg.role === 'user'">

            <!-- User message -->
            <div *ngIf="msg.role === 'user'" class="message user-message">
              <p>{{ msg.text }}</p>
            </div>

            <!-- Assistant message -->
            <div *ngIf="msg.role === 'assistant'" class="message assistant-message">
              <div class="assistant-header">
                <mat-icon class="bot-icon">smart_toy</mat-icon>
                <span>AI Analyst</span>
              </div>

              <!-- Loading -->
              <div *ngIf="msg.loading" class="loading-row">
                <mat-spinner diameter="18"></mat-spinner>
                <span>Analysing your portfolio...</span>
              </div>

              <!-- Answer -->
              <p *ngIf="!msg.loading" class="answer-text">{{ msg.text }}</p>

              <!-- Sources -->
              <div *ngIf="!msg.loading && msg.sources?.length" class="sources-row">
                <span class="sources-label">Sources:</span>
                <mat-chip *ngFor="let s of msg.sources" class="source-chip">{{ s }}</mat-chip>
              </div>
            </div>

          </div>
        </div>

        <!-- Input -->
        <div class="input-row">
          <mat-form-field appearance="outline" class="input-field">
            <input
              matInput
              [(ngModel)]="currentQuestion"
              placeholder="Ask about your portfolio risk..."
              (keydown.enter)="send()"
              [disabled]="loading"
            />
          </mat-form-field>
          <button
            mat-flat-button
            color="primary"
            (click)="send()"
            [disabled]="!currentQuestion.trim() || loading"
            class="send-btn"
          >
            <mat-icon>send</mat-icon>
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .chat-page { max-width: 860px; margin: 0 auto; }

    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    .page-header h1 { font-size: 1.8rem; font-weight: 600; margin: 0 0 4px; }
    .subtitle { color: #94a3b8; margin: 0; font-size: 14px; }

    .empty-state { text-align: center; padding: 4rem; color: #64748b; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; margin-bottom: 1rem; }

    .chat-layout { display: flex; flex-direction: column; gap: 1rem; }

    .suggestions-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0 0 10px; }
    .suggestion-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .suggestion-btn {
      font-size: 13px;
      color: #94a3b8;
      border-color: #2d3748;
      border-radius: 20px;
      padding: 4px 14px;
      text-align: left;
      white-space: normal;
      height: auto;
      line-height: 1.4;
    }
    .suggestion-btn:hover { border-color: #3b82f6; color: #3b82f6; }

    .messages-container { display: flex; flex-direction: column; gap: 1rem; min-height: 100px; }

    .message-row { display: flex; }
    .user-row { justify-content: flex-end; }

    .message { max-width: 80%; border-radius: 12px; padding: 12px 16px; }

    .user-message {
      background: #1e40af;
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .user-message p { margin: 0; font-size: 14px; }

    .assistant-message {
      background: #1a1f2e;
      border: 1px solid #2d3748;
      border-bottom-left-radius: 4px;
      width: 100%;
    }

    .assistant-header { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
    .bot-icon { font-size: 16px; height: 16px; width: 16px; color: #3b82f6; }
    .assistant-header span { font-size: 12px; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }

    .loading-row { display: flex; align-items: center; gap: 10px; color: #64748b; font-size: 13px; }

    .answer-text { margin: 0; font-size: 14px; line-height: 1.7; color: #e2e8f0; white-space: pre-wrap; }

    .sources-row { display: flex; align-items: center; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
    .sources-label { font-size: 11px; color: #64748b; }
    .source-chip {
      font-size: 11px !important;
      background: rgba(59,130,246,0.1) !important;
      color: #93c5fd !important;
      height: 22px !important;
      min-height: 22px !important;
    }

    .input-row { display: flex; gap: 10px; align-items: center; margin-top: 1rem; }
    .input-field { flex: 1; }
    .send-btn { height: 56px; width: 56px; min-width: 56px; }
  `]
})
export class ChatComponent implements OnInit {
  metrics: RiskMetrics | null = null;
  messages: Message[] = [];
  currentQuestion = '';
  loading = false;

  suggestedQuestions = [
    'Why is my portfolio risky?',
    'Which stock contributes most to my portfolio volatility?',
    'How can I diversify my portfolio?',
    'Is my Sharpe ratio good?',
    'What does my VaR mean in practice?',
    'How would rising interest rates affect my portfolio?',
  ];

  constructor(
    private portfolioService: PortfolioService,
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit() {
    this.metrics = this.portfolioService.getMetrics();
  }

  buildPortfolioContext(): string {
    if (!this.metrics) return '';
    const m = this.metrics;
    const assetSummary = m.assets
      .map(a => `${a.ticker}: weight ${a.weight}%, annual return ${a.annual_return}%, volatility ${a.volatility}%, risk contribution ${a.contribution_to_risk}%`)
      .join('\n');

    return `
Portfolio Return: ${m.portfolio_return}%
Volatility: ${m.volatility}%
Sharpe Ratio: ${m.sharpe_ratio}
VaR 95%: ${m.var_95}%
VaR 99%: ${m.var_99}%

Asset Breakdown:
${assetSummary}
    `.trim();
  }

  askSuggestion(question: string) {
    this.currentQuestion = question;
    this.send();
  }

  send() {
    const question = this.currentQuestion.trim();
    if (!question || this.loading) return;

    // Add user message
    this.messages.push({ role: 'user', text: question });
    this.currentQuestion = '';
    this.loading = true;

    // Add loading placeholder
    const loadingMsg: Message = { role: 'assistant', text: '', loading: true };
    this.messages.push(loadingMsg);

    this.http.post<{ answer: string; sources: string[] }>('/api/chat/ask', {
      question,
      portfolio_context: this.buildPortfolioContext(),
    }).subscribe({
      next: (res) => {
        const idx = this.messages.lastIndexOf(loadingMsg);
        this.messages[idx] = {
          role: 'assistant',
          text: res.answer,
          sources: res.sources,
          loading: false,
        };
        this.loading = false;
      },
      error: () => {
        const idx = this.messages.lastIndexOf(loadingMsg);
        this.messages[idx] = {
          role: 'assistant',
          text: 'Sorry, something went wrong. Make sure Ollama is running.',
          loading: false,
        };
        this.loading = false;
      }
    });
  }

  back()       { this.router.navigate(['/dashboard']); }
  goToUpload() { this.router.navigate(['/']); }
}