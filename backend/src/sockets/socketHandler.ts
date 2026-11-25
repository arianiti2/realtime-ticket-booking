import { Server, Socket } from 'socket.io';
import { BookingService } from '../modules/bookings/booking.service';

export const setupSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    // Përdoruesi hyn në "dhomën" e një eventi specifik
    socket.on('join_event', (eventId: string) => {
      socket.join(`event_${eventId}`);
    });

    // Përdoruesi klikon një ulëse për ta bllokuar
    socket.on('select_seat', async (data: { eventId: string; seatNumber: string; userId: string }) => {
      try {
        const result = await BookingService.lockSeat(data.eventId, data.seatNumber, data.userId);
        
        // Njofto TË GJITHË në atë event që ulësja u bë e verdhë (LOCKED)
        io.to(`event_${data.eventId}`).emit('seat_updated', result);
      } catch (error: any) {
        // Njofto vetëm përdoruesin që dështoi
        socket.emit('seat_error', { message: error.message, seatNumber: data.seatNumber });
      }
    });
  });
};
