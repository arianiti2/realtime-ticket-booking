import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { EventItem, Seat } from '../../models';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (event(); as ev) {
      <section>
        <div class="mb-8 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/15 via-slate-900 to-slate-900 p-6 sm:p-8">
          <span class="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Zgjedhja e ulëseve</span>
          <h1 class="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">{{ ev.title }}</h1>
          <p class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
            <span>⌖ {{ ev.venue }}</span>
            <span>◷ {{ ev.date | date:'medium' }}</span>
          </p>
        </div>

        @if (errorMsg()) {
          <div role="alert" class="mb-6 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {{ errorMsg() }}
          </div>
        }

        <div class="mb-6 flex flex-wrap gap-x-5 gap-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-xs text-slate-300 sm:text-sm">
          <span class="flex items-center gap-2"><i class="size-3 rounded-sm bg-emerald-500"></i>E lirë</span>
          <span class="flex items-center gap-2"><i class="size-3 rounded-sm bg-indigo-500"></i>E bllokuar nga ti</span>
          <span class="flex items-center gap-2"><i class="size-3 rounded-sm bg-amber-500"></i>E bllokuar (tjetër)</span>
          <span class="flex items-center gap-2"><i class="size-3 rounded-sm bg-slate-600"></i>E rezervuar</span>
        </div>

        <div class="mb-8 rounded-xl border border-indigo-300/10 bg-gradient-to-b from-slate-700 to-slate-800 px-4 py-3 text-center text-xs font-bold tracking-[0.35em] text-slate-200 shadow-inner sm:text-sm">
          SKENA
        </div>

        <div class="overflow-x-auto rounded-3xl border border-white/10 bg-slate-900/50 px-3 py-6 sm:px-6 sm:py-8">
          <div class="mx-auto flex min-w-max flex-col items-center gap-3">
            @for (row of groupedRows(); track row.letter) {
              <div class="flex items-center gap-2 sm:gap-4">
                <span class="grid size-8 shrink-0 place-items-center rounded-lg bg-white/5 text-sm font-bold text-slate-400">{{ row.letter }}</span>
                <div class="flex flex-wrap justify-center gap-2">
                  @for (seat of row.seats; track seat.seatNumber) {
                    <button
                      class="flex size-14 flex-col items-center justify-center rounded-xl border text-xs font-bold shadow-sm transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-70 sm:size-16"
                      [class.border-emerald-500]="seat.status === 'AVAILABLE'"
                      [class.bg-emerald-950]="seat.status === 'AVAILABLE'"
                      [class.text-emerald-200]="seat.status === 'AVAILABLE'"
                      [class.hover:bg-emerald-900]="seat.status === 'AVAILABLE'"
                      [class.border-indigo-300]="isMyLock(seat)"
                      [class.bg-indigo-500]="isMyLock(seat)"
                      [class.text-white]="isMyLock(seat)"
                      [class.border-amber-500]="seat.status === 'LOCKED' && !isMyLock(seat)"
                      [class.bg-amber-950]="seat.status === 'LOCKED' && !isMyLock(seat)"
                      [class.text-amber-200]="seat.status === 'LOCKED' && !isMyLock(seat)"
                      [class.border-slate-700]="seat.status === 'BOOKED'"
                      [class.bg-slate-800]="seat.status === 'BOOKED'"
                      [class.text-slate-500]="seat.status === 'BOOKED'"
                      [class.line-through]="seat.status === 'BOOKED'"
                      [disabled]="seat.status === 'BOOKED' || (seat.status === 'LOCKED' && !isMyLock(seat))"
                      [attr.aria-label]="'Ulësja ' + seat.seatNumber + ', ' + seat.status + ', ' + seat.price + ' euro'"
                      (click)="onSeatClick(seat)">
                      {{ seat.seatNumber }}
                      <small class="mt-0.5 text-[10px] font-medium opacity-80">{{ seat.price }}€</small>
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        @if (myLockedSeat(); as selected) {
          <div class="fixed inset-x-3 bottom-3 z-20 flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/95 p-4 text-white shadow-2xl shadow-black/50 backdrop-blur-xl sm:inset-x-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <strong class="text-sm sm:text-base">Ulësja {{ selected.seatNumber }} · {{ selected.price }}€</strong>
              <div class="mt-1 text-xs text-amber-300 sm:text-sm">
                Koha e mbetur e bllokimit: <strong>{{ countdown() }}</strong>
              </div>
            </div>
            <button [disabled]="checkingOut()" (click)="checkout(selected.seatNumber)"
              class="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base">
              {{ checkingOut() ? 'Duke gjeneruar biletën...' : 'Konfirmo & blej biletën' }}
            </button>
          </div>
        }
      </section>
    } @else {
      <div class="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center text-slate-400">
        Duke ngarkuar hartën e ulëseve...
      </div>
    }
  `
})
export class EventDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private socket = inject(SocketService);

  event = signal<EventItem | null>(null);
  errorMsg = signal('');
  checkingOut = signal(false);
  countdown = signal('05:00');

  private subs = new Subscription();
  private timerInterval?: ReturnType<typeof setInterval>;

  groupedRows = computed(() => {
    const seats = this.event()?.seats || [];
    const map = new Map<string, Seat[]>();
    for (const seat of seats) {
      if (!map.has(seat.row)) map.set(seat.row, []);
      map.get(seat.row)!.push(seat);
    }
    return Array.from(map.entries()).map(([letter, rowSeats]) => ({ letter, seats: rowSeats }));
  });

  myLockedSeat = computed(() => {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return null;
    return this.event()?.seats?.find(s => s.status === 'LOCKED' && s.lockedBy === userId) || null;
  });

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('id')!;

    this.api.getEventById(eventId).subscribe(ev => {
      this.event.set(ev);
      this.socket.joinEvent(eventId);
      this.startTimerLoop();
    });

    this.subs.add(
      this.socket.onSeatUpdated().subscribe(update => {
        this.event.update(ev => {
          if (!ev || !ev.seats) return ev;
          return {
            ...ev,
            seats: ev.seats.map(s =>
              s.seatNumber === update.seatNumber
                ? { ...s, status: update.status, lockedBy: update.lockedBy, lockExpiresAt: update.expiresAt || null }
                : s
            )
          };
        });
      })
    );

    this.subs.add(
      this.socket.onSeatError().subscribe(err => {
        this.errorMsg.set(err.message);
        setTimeout(() => this.errorMsg.set(''), 4000);
      })
    );
  }

  isMyLock(seat: Seat): boolean {
    const userId = this.auth.currentUser()?.id;
    return seat.status === 'LOCKED' && !!userId && seat.lockedBy === userId;
  }

  onSeatClick(seat: Seat) {
    const user = this.auth.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    if (seat.status === 'AVAILABLE') {
      this.socket.selectSeat(this.event()!._id, seat.seatNumber, user.id);
    }
  }

  checkout(seatNumber: string) {
    const eventId = this.event()!._id;
    this.checkingOut.set(true);
    this.api.checkoutSeat(eventId, seatNumber).subscribe({
      next: () => {
        this.checkingOut.set(false);
        this.router.navigate(['/my-tickets']);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Blerja dështoi.');
        this.checkingOut.set(false);
      }
    });
  }

  private startTimerLoop() {
    this.timerInterval = setInterval(() => {
      const locked = this.myLockedSeat();
      if (!locked?.lockExpiresAt) {
        this.countdown.set('05:00');
        return;
      }
      const diff = new Date(locked.lockExpiresAt).getTime() - Date.now();
      if (diff <= 0) {
        this.countdown.set('00:00');
      } else {
        const mins = Math.floor(diff / 60000).toString().padStart(2, '0');
        const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        this.countdown.set(`${mins}:${secs}`);
      }
    }, 1000);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
}
