import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SeatUpdatedPayload } from '../models';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.socketUrl, { withCredentials: true });
  }

  joinEvent(eventId: string) {
    this.socket.emit('join_event', eventId);
  }

  selectSeat(eventId: string, seatNumber: string, userId: string) {
    this.socket.emit('select_seat', { eventId, seatNumber, userId });
  }

  onSeatUpdated(): Observable<SeatUpdatedPayload> {
    return new Observable(observer => {
      const handler = (data: SeatUpdatedPayload) => observer.next(data);
      this.socket.on('seat_updated', handler);
      return () => this.socket.off('seat_updated', handler);
    });
  }

  onSeatError(): Observable<{ message: string; seatNumber: string }> {
    return new Observable(observer => {
      const handler = (err: { message: string; seatNumber: string }) => observer.next(err);
      this.socket.on('seat_error', handler);
      return () => this.socket.off('seat_error', handler);
    });
  }
}
