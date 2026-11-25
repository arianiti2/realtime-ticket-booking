import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  seatNumber: string;
  pricePaid: number;
  qrCodeData: string;
  isUsed: boolean;
  usedAt?: Date | null;
}

const TicketSchema = new Schema<ITicket>({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  seatNumber: { type: String, required: true },
  pricePaid: { type: Number, required: true },
  qrCodeData: { type: String, required: true },
  isUsed: { type: Boolean, default: false },
  usedAt: { type: Date, default: null }
}, { timestamps: true });

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);
