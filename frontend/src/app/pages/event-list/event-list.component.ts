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
    <h2>Eventet e Ardhshme</h2>

    @if (loading()) {
      <p>Duke ngarkuar eventet...</p>
    } @else if (events().length === 0) {
      <p>Nuk ka evente të publikuara ende.</p>
    } @else {
      <div class="grid">
        @for (event of events(); track event._id) {
          <div class="card">
            <h3>{{ event.title }}</h3>
            <p>📍 <strong>Vendi:</strong> {{ event.venue }}</p>
            <p>📅 <strong>Data:</strong> {{ event.date | date:'medium' }}</p>
            <a [routerLink]="['/events', event._id]" class="btn">Zgjidh Ulëset</a>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
    .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.04); }
    .card h3 { margin-top: 0; color: #0f172a; }
    .btn { display: inline-block; margin-top: 1rem; padding: 0.6rem 1.2rem; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .btn:hover { background: #1d4ed8; }
  `]
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
