import { Router } from 'express';
import { createEvent, getAllEvents, getEventById } from './event.controller';
import { protect, authorizeRoles } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', protect, authorizeRoles('ORGANIZER'), createEvent);

export default router;
