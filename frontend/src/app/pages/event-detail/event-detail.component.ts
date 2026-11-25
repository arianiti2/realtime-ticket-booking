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
      <div class="header">
        <h2>{{ ev.title }}</h2>
        <p>📍 {{ ev.venue }} • 📅 {{ ev.date | date:'medium' }}</p>
      </div>

      @if (errorMsg()) {
        <div class="alert-error">{{ errorMsg() }}</div>
      }

      <div class="legend">
        <span><i class="box available"></i> E Lirë</span>
        <span><i class="box mine"></i> E Bllokuar nga Ti</span>
        <span><i class="box locked"></i> E Bllokuar (Tjetër)</span>
        <span><i class="box booked"></i> E Rezervuar</span>
      </div>

      <div class="stage">SKENA / STAGE</div>

      <div class="seat-map">
        @for (row of groupedRows(); track row.letter) {
          <div class="seat-row">
            <span class="row-label">{{ row.letter }}</span>
            <div class="seats">
              @for (seat of row.seats; track seat.seatNumber) {
                <button
                  class="seat"
                  [class.available]="seat.status === 'AVAILABLE'"
                  [class.mine]="isMyLock(seat)"
                  [class.locked]="seat.status === 'LOCKED' && !isMyLock(seat)"
                  [class.booked]="seat.status === 'BOOKED'"
                  [disabled]="seat.status === 'BOOKED' || (seat.status === 'LOCKED' && !isMyLock(seat))"
                  (click)="onSeatClick(seat)">
                  {{ seat.seatNumber }}
                  <small>{{ seat.price }}€</small>
                </button>
              }
            </div>
          </div>
        }
      </div>

      @if (myLockedSeat(); as selected) {
        <div class="checkout-bar">
          <div>
            <strong>Ulësja e zgjedhur: {{ selected.seatNumber }}</strong> ({{ selected.price }}€)
            <div class="timer">⏳ Koha e mbetur e bllokimit: <strong>{{ countdown() }}</strong></div>
          </div>
          <button class="btn-checkout" [disabled]="checkingOut()" (click)="checkout(selected.seatNumber)">
            {{ checkingOut() ? 'Duke gjeneruar biletën...' : 'Konfirmo & Blej Biletën' }}
          </button>
        </div>
      }
    } @else {
      <p>Duke ngarkuar hartën e ulëseve...</p>
    }
  `,
  styles: [`
    .header { margin-bottom: 1rem; }
    .alert-error { background: #fee2e2; color: #b91c1c; padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; }
    .legend { display: flex; gap: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; font-size: 0.9rem; }
    .box { display: inline-block; width: 14px; height: 14px; border-radius: 3px; vertical-align: middle; margin-right: 5px; }
    .stage { text-align: center; background: #cbd5e1; color: #334155; font-weight: bold; padding: 0.5rem; border-radius: 4px; margin-bottom: 2rem; letter-spacing: 2px; }
    .seat-map { display: flex; flex-direction: column; gap: 0.6rem; align-items: center; }
    .seat-row { display: flex; align-items: center; gap: 0.75rem; }
    .row-label { width: 24px; font-weight: bold; color: #475569; }
    .seats { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .seat { width: 54px; height: 48px; border: none; border-radius: 6px; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 600; font-size: 0.8rem; }
    .seat small { font-size: 0.68rem; opacity: 0.85; }
    .available { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
    .available:hover { background: #bbf7d0; }
    .mine { background: #2563eb; color: white; }
    .locked { background: #fef08a; color: #854d0e; cursor: not-allowed; }
    .booked { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; text-decoration: line-through; }
    .checkout-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #0f172a; color: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 -4px 12px rgba(0,0,0,0.15); }
    .timer { color: #fbbf24; font-size: 0.9rem; margin-top: 0.25rem; }
    .btn-checkout { background: #16a34a; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 1rem; }
    .btn-checkout:disabled { opacity: 0.6; }
  `]
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
