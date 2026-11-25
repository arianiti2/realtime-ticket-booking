import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-validate-ticket',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="mx-auto max-w-2xl">
      <div class="mb-7">
        <span class="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Paneli i organizatorit</span>
        <h1 class="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Verifikimi i biletës</h1>
        <p class="mt-3 text-sm leading-6 text-slate-400">Kontrollo biletën dhe shënoje si të përdorur në hyrje.</p>
      </div>

      <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 sm:p-8">
        <form (ngSubmit)="onValidate()" class="space-y-4">
          <div>
            <label for="ticket-id" class="mb-2 block text-sm font-medium text-slate-300">ID e biletës</label>
            <input id="ticket-id" type="text" [(ngModel)]="ticketId" name="ticketId" placeholder="Ngjit Ticket ID këtu..." required
              class="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 font-mono text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10" />
          </div>
          <button type="submit" [disabled]="loading()"
            class="w-full rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60">
            {{ loading() ? 'Duke verifikuar...' : 'Verifiko biletën' }}
          </button>
        </form>

        @if (result(); as res) {
          <div class="mt-6 rounded-2xl border p-5"
            [class.border-emerald-400/20]="res.valid"
            [class.bg-emerald-400/10]="res.valid"
            [class.text-emerald-100]="res.valid"
            [class.border-rose-400/20]="!res.valid"
            [class.bg-rose-400/10]="!res.valid"
            [class.text-rose-100]="!res.valid">
            <h2 class="text-lg font-bold">{{ res.valid ? 'Hyrja u aprovua' : 'Biletë e pavlefshme' }}</h2>
            <p class="mt-2 text-sm">{{ res.message }}</p>
            @if (res.ticket) {
              <div class="mt-4 space-y-1 border-t border-current/10 pt-4 text-sm">
                <p><strong>Eventi:</strong> {{ res.ticket.eventId.title }}</p>
                <p><strong>Ulësja:</strong> {{ res.ticket.seatNumber }}</p>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `
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
