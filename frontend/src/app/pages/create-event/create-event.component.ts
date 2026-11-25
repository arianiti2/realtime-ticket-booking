import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="mx-auto max-w-3xl">
      <div class="mb-7">
        <span class="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Paneli i organizatorit</span>
        <h1 class="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Krijo event të ri</h1>
        <p class="mt-3 text-sm text-slate-400">Plotëso detajet dhe përgatit hartën e ulëseve për eventin.</p>
      </div>

      <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 sm:p-8">
        @if (error()) {
          <div role="alert" class="mb-6 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {{ error() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="space-y-5">
          <div>
            <label for="event-title" class="mb-2 block text-sm font-medium text-slate-300">Titulli i eventit</label>
            <input id="event-title" type="text" [(ngModel)]="title" name="title" placeholder="p.sh. Koncert Live" required
              class="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10" />
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label for="event-date" class="mb-2 block text-sm font-medium text-slate-300">Data dhe ora</label>
              <input id="event-date" type="datetime-local" [(ngModel)]="date" name="date" required
                class="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10" />
            </div>
            <div>
              <label for="event-venue" class="mb-2 block text-sm font-medium text-slate-300">Vendi</label>
              <input id="event-venue" type="text" [(ngModel)]="venue" name="venue" placeholder="p.sh. Pallati i Rinisë" required
                class="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10" />
            </div>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label for="event-rows" class="mb-2 block text-sm font-medium text-slate-300">Numri i rreshtave (max 26)</label>
              <input id="event-rows" type="number" [(ngModel)]="rows" name="rows" min="1" max="26" required
                class="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10" />
            </div>
            <div>
              <label for="event-seats" class="mb-2 block text-sm font-medium text-slate-300">Ulëse për rresht</label>
              <input id="event-seats" type="number" [(ngModel)]="seatsPerRow" name="seatsPerRow" min="1" max="30" required
                class="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10" />
            </div>
          </div>

          <div>
            <label for="event-vip-rows" class="mb-2 block text-sm font-medium text-slate-300">Rreshtat VIP (të ndarë me presje)</label>
            <input id="event-vip-rows" type="text" [(ngModel)]="vipRowsInput" name="vipRowsInput" placeholder="A, B"
              class="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10" />
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label for="event-vip-price" class="mb-2 block text-sm font-medium text-slate-300">Çmimi VIP (€)</label>
              <input id="event-vip-price" type="number" [(ngModel)]="vipPrice" name="vipPrice" min="0" required
                class="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10" />
            </div>
            <div>
              <label for="event-standard-price" class="mb-2 block text-sm font-medium text-slate-300">Çmimi standard (€)</label>
              <input id="event-standard-price" type="number" [(ngModel)]="standardPrice" name="standardPrice" min="0" required
                class="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10" />
            </div>
          </div>

          <button type="submit" [disabled]="loading()"
            class="w-full rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60">
            {{ loading() ? 'Duke krijuar...' : 'Publiko eventin' }}
          </button>
        </form>
      </div>
    </section>
  `
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
