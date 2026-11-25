import mongoose, { Schema, Document } from 'mongoose';

export interface ISeat {
  seatNumber: string; 
  row: string;
  price: number;
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
  lockedBy?: mongoose.Types.ObjectId | null;
  lockExpiresAt?: Date | null;
}

export interface IEvent extends Document {
  title: string;
  date: Date;
  venue: string;
  seats: ISeat[];
}

const SeatSchema = new Schema<ISeat>({
  seatNumber: { type: String, required: true },
  row: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['AVAILABLE', 'LOCKED', 'BOOKED'], default: 'AVAILABLE' },
  lockedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  lockExpiresAt: { type: Date, default: null }
});

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  seats: [SeatSchema]
}, { timestamps: true });

export const Event = mongoose.model<IEvent>('Event', EventSchema);
