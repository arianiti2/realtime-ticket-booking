import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Ticket } from '../../models';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [DatePipe],
  template: `
    <h2>Biletat e Mia</h2>

    @if (loading()) {
      <p>Duke ngarkuar biletat...</p>
    } @else if (tickets().length === 0) {
      <p>Nuk ke blerë asnjë biletë ende.</p>
    } @else {
      <div class="tickets-grid">
        @for (ticket of tickets(); track ticket._id) {
          <div class="ticket-card" [class.used]="ticket.isUsed">
            <div class="ticket-info">
              <span class="status-badge" [class.badge-used]="ticket.isUsed">
                {{ ticket.isUsed ? 'E PËRDORUR' : 'E VLEFSHME' }}
              </span>
              <h3>{{ ticket.eventId.title }}</h3>
              <p>📍 {{ ticket.eventId.venue }}</p>
              <p>📅 {{ ticket.eventId.date | date:'medium' }}</p>
              <p>💺 <strong>Ulësja:</strong> {{ ticket.seatNumber }} • <strong>Çmimi:</strong> {{ ticket.pricePaid }}€</p>
              <p class="ticket-id"><strong>Ticket ID:</strong> <code>{{ ticket._id }}</code></p>
            </div>

            <div class="qr-box">
              <img [src]="ticket.qrCodeData" alt="QR Code i Biletës" />
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .tickets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
    .ticket-card { display: flex; justify-content: space-between; align-items: center; border: 1px solid #cbd5e1; border-radius: 10px; padding: 1.25rem; background: white; gap: 1rem; }
    .ticket-card.used { opacity: 0.7; background: #f8fafc; }
    .status-badge { display: inline-block; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; background: #dcfce7; color: #166534; }
    .badge-used { background: #fee2e2; color: #991b1b; }
    .ticket-id { font-size: 0.8rem; color: #475569; word-break: break-all; }
    .qr-box img { width: 130px; height: 130px; border: 1px solid #e2e8f0; border-radius: 6px; }
  `]
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
