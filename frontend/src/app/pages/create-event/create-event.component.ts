import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="form-card">
      <h2>Krijo Event të Ri</h2>
      @if (error()) {
        <div class="error-box">{{ error() }}</div>
      }

      <form (ngSubmit)="onSubmit()">
        <label>Titulli i Eventit</label>
        <input type="text" [(ngModel)]="title" name="title" placeholder="p.sh. Koncert Live" required />

        <label>Data & Ora</label>
        <input type="datetime-local" [(ngModel)]="date" name="date" required />

        <label>Vendi (Venue)</label>
        <input type="text" [(ngModel)]="venue" name="venue" placeholder="p.sh. Pallati i Rinisë" required />

        <div class="row-2">
          <div>
            <label>Numri i Rreshtave (max 26)</label>
            <input type="number" [(ngModel)]="rows" name="rows" min="1" max="26" required />
          </div>
          <div>
            <label>Ulëse për Rresht</label>
            <input type="number" [(ngModel)]="seatsPerRow" name="seatsPerRow" min="1" max="30" required />
          </div>
        </div>

        <label>Rreshtat VIP (të ndarë me presje, p.sh. A, B)</label>
        <input type="text" [(ngModel)]="vipRowsInput" name="vipRowsInput" placeholder="A, B" />

        <div class="row-2">
          <div>
            <label>Çmimi VIP (€)</label>
            <input type="number" [(ngModel)]="vipPrice" name="vipPrice" min="0" required />
          </div>
          <div>
            <label>Çmimi Standard (€)</label>
            <input type="number" [(ngModel)]="standardPrice" name="standardPrice" min="0" required />
          </div>
        </div>

        <button type="submit" [disabled]="loading()">
          {{ loading() ? 'Duke krijuar...' : 'Publiko Eventin' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .form-card { max-width: 520px; margin: 2rem auto; padding: 2rem; border: 1px solid #ddd; border-radius: 8px; background: white; }
    label { display: block; margin-top: 1rem; font-weight: 600; }
    input { width: 100%; padding: 0.6rem; margin-top: 0.3rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    button { width: 100%; margin-top: 1.5rem; padding: 0.8rem; background: #2563eb; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
    button:disabled { opacity: 0.6; }
    .error-box { background: #fee2e2; color: #b91c1c; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; }
  `]
})
export class CreateEventComponent {
  private api = inject(ApiService);
  private router = inject(Router);

  title = '';
  date = '';
  venue = '';
  rows = 5;
  seatsPerRow = 8;
  vipRowsInput = 'A';
  vipPrice = 30;
  standardPrice = 15;

  loading = signal(false);
  error = signal('');

  onSubmit() {
    this.loading.set(true);
    this.error.set('');

    const vipRows = this.vipRowsInput
      .split(',')
      .map(r => r.trim().toUpperCase())
      .filter(Boolean);

    this.api.createEvent({
      title: this.title,
      date: this.date,
      venue: this.venue,
      rows: this.rows,
      seatsPerRow: this.seatsPerRow,
      vipRows,
      vipPrice: this.vipPrice,
      standardPrice: this.standardPrice
    }).subscribe({
      next: (created) => this.router.navigate(['/events', created._id]),
      error: (err) => {
        this.error.set(err.error?.message || 'Gabim gjatë krijimit të eventit.');
        this.loading.set(false);
      }
    });
  }
}
