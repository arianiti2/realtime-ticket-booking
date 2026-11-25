import { Router } from 'express';
import { checkoutSeat, getMyTickets, validateTicket } from './ticket.controller';
import { protect, authorizeRoles } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/checkout', protect, checkoutSeat);
router.get('/my-tickets', protect, getMyTickets);
router.post('/validate', protect, authorizeRoles('ORGANIZER'), validateTicket);

export default router;
