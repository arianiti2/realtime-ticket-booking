import { Response } from 'express';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { Event } from '../events/event.model';
import { Ticket } from './ticket.model';

export const checkoutSeat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId, seatNumber } = req.body;
    const userId = req.user!.id;

    const event = await Event.findOneAndUpdate(
      {
        _id: eventId,
        seats: {
          $elemMatch: {
            seatNumber,
            status: 'LOCKED',
            lockedBy: userId,
            lockExpiresAt: { $gt: new Date() }
          }
        }
      },
      {
        $set: {
          'seats.$.status': 'BOOKED',
          'seats.$.lockExpiresAt': null
        }
      },
      { new: true }
    );

    if (!event) {
      res.status(400).json({ message: 'Bllokimi i ulëses ka skaduar ose ulësja nuk ju përket juve.' });
      return;
    }

    const bookedSeat = event.seats.find(s => s.seatNumber === seatNumber)!;
    const validationToken = crypto.randomBytes(16).toString('hex');
    const qrPayload = JSON.stringify({ eventId, seatNumber, userId, validationToken });
    const qrCodeData = await QRCode.toDataURL(qrPayload);

    const ticket = await Ticket.create({
      eventId,
      userId,
      seatNumber,
      pricePaid: bookedSeat.price,
      qrCodeData
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`event_${eventId}`).emit('seat_updated', {
        seatNumber,
        status: 'BOOKED',
        lockedBy: userId
      });
    }

    res.status(201).json(ticket);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tickets = await Ticket.find({ userId: req.user!.id }).populate('eventId', 'title date venue');
    res.status(200).json(tickets);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const validateTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId).populate('eventId', 'title').populate('userId', 'name email');
    if (!ticket) {
      res.status(404).json({ valid: false, message: 'Bileta nuk ekziston.' });
      return;
    }

    if (ticket.isUsed) {
      res.status(400).json({ valid: false, message: `Bileta është përdorur më parë më ${ticket.usedAt}.` });
      return;
    }

    ticket.isUsed = true;
    ticket.usedAt = new Date();
    await ticket.save();

    res.status(200).json({ valid: true, message: 'Bileta e vlefshme! Hyrja u aprovua.', ticket });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
