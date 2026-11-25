import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Ticket } from '../../models';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [DatePipe],
  template: `
    <section>
      <div class="mb-9 border-b border-white/10 pb-8">
        <span class="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Llogaria jote</span>
        <h1 class="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Biletat e mia</h1>
        <p class="mt-3 text-sm text-slate-400">Mbaji biletat digjitale pranë vetes për hyrje të shpejtë.</p>
      </div>

      @if (loading()) {
        <div class="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center text-slate-400">Duke ngarkuar biletat...</div>
      } @else if (tickets().length === 0) {
        <div class="rounded-3xl border border-dashed border-white/15 bg-slate-900/50 px-6 py-16 text-center">
          <span class="mx-auto grid size-14 place-items-center rounded-2xl bg-indigo-400/10 text-2xl text-indigo-200">▤</span>
          <h2 class="mt-5 text-xl font-bold text-white">Ende nuk ke bileta</h2>
          <p class="mt-2 text-sm text-slate-400">Biletat e blera do të shfaqen këtu.</p>
        </div>
      } @else {
        <div class="grid gap-5 xl:grid-cols-2">
          @for (ticket of tickets(); track ticket._id) {
            <article class="flex flex-col justify-between gap-5 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 p-5 transition sm:flex-row sm:items-center sm:p-6"
              [class.opacity-70]="ticket.isUsed">
              <div class="min-w-0">
                <span class="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold tracking-wider text-emerald-200"
                  [class.border-rose-400/20]="ticket.isUsed"
                  [class.bg-rose-400/10]="ticket.isUsed"
                  [class.text-rose-200]="ticket.isUsed">
                  {{ ticket.isUsed ? 'E PËRDORUR' : 'E VLEFSHME' }}
                </span>
                <h2 class="mt-4 text-xl font-bold text-white">{{ ticket.eventId.title }}</h2>
                <div class="mt-3 space-y-1.5 text-sm text-slate-400">
                  <p>⌖ {{ ticket.eventId.venue }}</p>
                  <p>◷ {{ ticket.eventId.date | date:'medium' }}</p>
                  <p>Ulësja <strong class="text-slate-200">{{ ticket.seatNumber }}</strong> · <strong class="text-slate-200">{{ ticket.pricePaid }}€</strong></p>
                </div>
                <p class="mt-4 break-all text-xs text-slate-500">
                  <strong class="text-slate-400">Ticket ID:</strong> <code>{{ ticket._id }}</code>
                </p>
              </div>

              <div class="grid shrink-0 place-items-center self-start rounded-2xl bg-white p-2 sm:self-center">
                <img class="size-32" [src]="ticket.qrCodeData" alt="QR Code i Biletës" />
              </div>
            </article>
          }
        </div>
      }
    </section>
  `
})
export class MyTicketsComponent implements OnInit {
  private api = inject(ApiService);
  tickets = signal<Ticket[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.api.getMyTickets().subscribe({
      next: (data) => {
        this.tickets.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
