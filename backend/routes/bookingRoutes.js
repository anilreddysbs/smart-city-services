import express from 'express';
import { createBooking, getCustomerBookings, getWorkerBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, createBooking);
router.get('/customer', authenticate, getCustomerBookings);
router.get('/worker', authenticate, authorize(['Worker']), getWorkerBookings);
router.put('/:id/status', authenticate, updateBookingStatus);

export default router;
