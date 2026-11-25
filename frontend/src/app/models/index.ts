export type Role = 'CLIENT' | 'ORGANIZER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Seat {
  seatNumber: string;
  row: string;
  price: number;
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
  lockedBy?: string | null;
  lockExpiresAt?: string | null;
}

export interface EventItem {
  _id: string;
  title: string;
  date: string;
  venue: string;
  seats?: Seat[];
}

export interface Ticket {
  _id: string;
  eventId: {
    _id: string;
    title: string;
    date: string;
    venue: string;
  };
  userId: string | { name: string; email: string };
  seatNumber: string;
  pricePaid: number;
  qrCodeData: string;
  isUsed: boolean;
  usedAt?: string | null;
}

export interface SeatUpdatedPayload {
  seatNumber: string;
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
  expiresAt?: string;
  lockedBy: string | null;
}
