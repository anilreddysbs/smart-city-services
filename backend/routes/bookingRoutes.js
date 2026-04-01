import express from 'express';
import { createBooking, getCustomerBookings, getWorkerBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createBookingSchema, updateBookingStatusSchema } from '../validation/schemas.js';

const router = express.Router();

router.post('/', authenticate, authorize(['Customer']), validate(createBookingSchema), createBooking);
router.get('/customer', authenticate, authorize(['Customer']), getCustomerBookings);
router.get('/worker', authenticate, authorize(['Worker']), getWorkerBookings);
router.put('/:id/status', authenticate, authorize(['Customer', 'Worker']), validate(updateBookingStatusSchema), updateBookingStatus);

export default router;
