import cron from 'node-cron';
import { Event } from '../modules/events/event.model';
import { Server } from 'socket.io';

export const startReleaseSeatsJob = (io: Server) => {
  cron.schedule('*/30 * * * * *', async () => {
    const now = new Date();
    
    // Gjej eventet që kanë ulëse të skaduara
    const events = await Event.find({
      'seats': { $elemMatch: { status: 'LOCKED', lockExpiresAt: { $lt: now } } }
    });

    for (const event of events) {
      const expiredSeats: string[] = [];

      event.seats.forEach(seat => {
        if (seat.status === 'LOCKED' && seat.lockExpiresAt && seat.lockExpiresAt < now) {
          seat.status = 'AVAILABLE';
          seat.lockedBy = null;
          seat.lockExpiresAt = null;
          expiredSeats.push(seat.seatNumber);
        }
      });

      if (expiredSeats.length > 0) {
        await event.save();
        // Njofto frontend-in të lirojë ulëset në ekran
        expiredSeats.forEach(seatNumber => {
          io.to(`event_${event._id}`).emit('seat_updated', {
            seatNumber,
            status: 'AVAILABLE',
            lockedBy: null
          });
        });
      }
    }
  });
};
