import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-validate-ticket',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="validate-card">
      <h2>Verifikimi i Biletës (Check-In)</h2>
      <p>Vendos ID-në e biletës për ta verifikuar dhe shënuar si të përdorur.</p>

      <form (ngSubmit)="onValidate()">
        <input
          type="text"
          [(ngModel)]="ticketId"
          name="ticketId"
          placeholder="Ngjit Ticket ID këtu..."
          required />
        <button type="submit" [disabled]="loading()">
          {{ loading() ? 'Duke verifikuar...' : 'Verifiko Biletën' }}
        </button>
      </form>

      @if (result(); as res) {
        <div class="result-box" [class.valid]="res.valid" [class.invalid]="!res.valid">
          <h3>{{ res.valid ? '✅ Hyrja u Aprovua' : '❌ Biletë e Pavlefshme' }}</h3>
          <p>{{ res.message }}</p>
          @if (res.ticket) {
            <p><strong>Eventi:</strong> {{ res.ticket.eventId.title }}</p>
            <p><strong>Ulësja:</strong> {{ res.ticket.seatNumber }}</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .validate-card { max-width: 480px; margin: 2.5rem auto; padding: 2rem; border: 1px solid #ddd; border-radius: 8px; background: white; }
    input { width: 100%; padding: 0.7rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; margin-bottom: 1rem; font-family: monospace; }
    button { width: 100%; padding: 0.75rem; background: #0f172a; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
    .result-box { margin-top: 1.5rem; padding: 1rem; border-radius: 6px; }
    .valid { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
    .invalid { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
  `]
})
export class ValidateTicketComponent {
  private api = inject(ApiService);

  ticketId = '';
  loading = signal(false);
  result = signal<{ valid: boolean; message: string; ticket?: any } | null>(null);

  onValidate() {
    if (!this.ticketId.trim()) return;
    this.loading.set(true);
    this.result.set(null);

    this.api.validateTicket(this.ticketId.trim()).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.result.set({
          valid: false,
          message: err.error?.message || 'Gabim gjatë verifikimit të biletës.'
        });
        this.loading.set(false);
      }
    });
  }
}
