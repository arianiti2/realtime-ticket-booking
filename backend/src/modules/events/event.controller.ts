import { Request, Response } from 'express';
import { Event, ISeat } from './event.model';

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, date, venue, rows, seatsPerRow, vipRows, vipPrice, standardPrice } = req.body;

    const seats: ISeat[] = [];
    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let r = 0; r < rows; r++) {
      const rowLetter = rowLetters[r];
      const isVip = vipRows && vipRows.includes(rowLetter);

      for (let s = 1; s <= seatsPerRow; s++) {
        seats.push({
          seatNumber: `${rowLetter}${s}`,
          row: rowLetter,
          price: isVip ? vipPrice : standardPrice,
          status: 'AVAILABLE',
          lockedBy: null,
          lockExpiresAt: null
        });
      }
    }

    const event = await Event.create({ title, date, venue, seats });
    res.status(201).json(event);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await Event.find().select('-seats');
    res.status(200).json(events);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ message: 'Eventi nuk u gjet.' });
      return;
    }
    res.status(200).json(event);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
