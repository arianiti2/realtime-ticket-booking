import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { EventItem } from '../../models';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <section>
      <div class="mb-9 flex flex-col gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Zbulo përjetimin e radhës</span>
          <h1 class="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Eventet e ardhshme</h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Gjej vendin tënd në koncertet, shfaqjet dhe eventet që po vijnë.
          </p>
        </div>
        <span class="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
          {{ events().length }} evente
        </span>
      </div>

      @if (loading()) {
        <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          @for (placeholder of [1, 2, 3]; track placeholder) {
            <div class="h-64 animate-pulse rounded-2xl border border-white/10 bg-slate-900"></div>
          }
        </div>
      } @else if (events().length === 0) {
        <div class="rounded-3xl border border-dashed border-white/15 bg-slate-900/50 px-6 py-16 text-center">
          <span class="mx-auto grid size-14 place-items-center rounded-2xl bg-indigo-400/10 text-2xl text-indigo-200">✦</span>
          <h2 class="mt-5 text-xl font-bold text-white">Ende s’ka evente</h2>
          <p class="mt-2 text-sm text-slate-400">Eventet e publikuara do të shfaqen këtu.</p>
        </div>
      } @else {
        <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          @for (event of events(); track event._id) {
            <article class="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/40 hover:shadow-xl hover:shadow-indigo-950/30">
              <div class="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-400 to-cyan-300"></div>
              <div class="p-6">
                <span class="inline-flex rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-xs font-semibold text-indigo-200">
                  Event live
                </span>
                <h2 class="mt-4 line-clamp-2 text-xl font-bold text-white transition group-hover:text-indigo-200">{{ event.title }}</h2>
                <div class="mt-5 space-y-3 text-sm text-slate-400">
                  <p class="flex items-start gap-3"><span class="text-indigo-300">⌖</span><span><strong class="text-slate-200">Vendi</strong><br />{{ event.venue }}</span></p>
                  <p class="flex items-start gap-3"><span class="text-indigo-300">◷</span><span><strong class="text-slate-200">Data</strong><br />{{ event.date | date:'medium' }}</span></p>
                </div>
                <a [routerLink]="['/events', event._id]"
                  class="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400">
                  Zgjidh ulëset <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          }
        </div>
      }
    </section>
  `
})
export class EventListComponent implements OnInit {
  private api = inject(ApiService);
  events = signal<EventItem[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.api.getEvents().subscribe({
      next: (data) => {
        this.events.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
