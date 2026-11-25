import { Event } from '../events/event.model';
import mongoose from 'mongoose';

export class BookingService {
  static async lockSeat(eventId: string, seatNumber: string, userId: string) {
    const lockDurationMinutes = 5;
    const expiresAt = new Date(Date.now() + lockDurationMinutes * 60 * 1000);


    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        seats: {
          $elemMatch: {
            seatNumber: seatNumber,
            $or: [
              { status: 'AVAILABLE' },
              { status: 'LOCKED', lockExpiresAt: { $lt: new Date() } }
            ]
          }
        }
      },
      {
        $set: {
          'seats.$.status': 'LOCKED',
          'seats.$.lockedBy': new mongoose.Types.ObjectId(userId),
          'seats.$.lockExpiresAt': expiresAt
        }
      },
      { new: true }
    );

    if (!updatedEvent) {
      throw new Error('Ulësja sapo u rezervua nga një përdorues tjetër ose nuk është e lirë.');
    }

    return { seatNumber, status: 'LOCKED', expiresAt, lockedBy: userId };
  }
}
