import { Server, Socket } from 'socket.io';
import { BookingService } from '../modules/bookings/booking.service';

export const setupSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {

    socket.on('join_event', (eventId: string) => {
      socket.join(`event_${eventId}`);
    });


    socket.on('select_seat', async (data: { eventId: string; seatNumber: string; userId: string }) => {
      try {
        const result = await BookingService.lockSeat(data.eventId, data.seatNumber, data.userId);
        

        io.to(`event_${data.eventId}`).emit('seat_updated', result);
      } catch (error: any) {
 
        socket.emit('seat_error', { message: error.message, seatNumber: data.seatNumber });
      }
    });
  });
};
