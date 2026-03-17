import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary">
      <mat-icon>analytics</mat-icon>
      <span style="margin-left: 8px; font-weight: 600;">Portfolio Risk Platform</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact:true}">
        <mat-icon>upload_file</mat-icon> Upload
      </a>
      <a mat-button routerLink="/dashboard" routerLinkActive="active-link">
        <mat-icon>dashboard</mat-icon> Dashboard
      </a>
      <a mat-button routerLink="/chat" routerLinkActive="active-link">
        <mat-icon>smart_toy</mat-icon> AI Analyst
      </a>
    </mat-toolbar>
  `,
  styles: [`
    .spacer { flex: 1; }
    .active-link { background: rgba(255,255,255,0.15); border-radius: 4px; }
    mat-icon { font-size: 18px; height: 18px; width: 18px; }
  `]
})
export class NavbarComponent {}