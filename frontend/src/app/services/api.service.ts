import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { EventItem, Ticket } from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Events
  getEvents() {
    return this.http.get<EventItem[]>(`${this.apiUrl}/events`);
  }

  getEventById(id: string) {
    return this.http.get<EventItem>(`${this.apiUrl}/events/${id}`);
  }

  createEvent(payload: {
    title: string;
    date: string;
    venue: string;
    rows: number;
    seatsPerRow: number;
    vipRows: string[];
    vipPrice: number;
    standardPrice: number;
  }) {
    return this.http.post<EventItem>(`${this.apiUrl}/events`, payload);
  }

  // Tickets
  checkoutSeat(eventId: string, seatNumber: string) {
    return this.http.post<Ticket>(`${this.apiUrl}/tickets/checkout`, { eventId, seatNumber });
  }

  getMyTickets() {
    return this.http.get<Ticket[]>(`${this.apiUrl}/tickets/my-tickets`);
  }

  validateTicket(ticketId: string) {
    return this.http.post<{ valid: boolean; message: string; ticket?: Ticket }>(
      `${this.apiUrl}/tickets/validate`,
      { ticketId }
    );
  }
}
