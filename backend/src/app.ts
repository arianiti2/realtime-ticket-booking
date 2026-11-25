import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './modules/auth/auth.routes';
import eventRoutes from './modules/events/event.routes';
import ticketRoutes from './modules/tickets/ticket.routes';

const app: Application = express();

// 1. CORS duhet të jetë i pari dhe të lejojë OPTIONS (preflight)
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 2. Helmet me crossOriginResourcePolicy: false që të mos bllokojë Angular-in
app.use(helmet({
  crossOriginResourcePolicy: false
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Serveri po punon me sukses!' });
});

export default app;
