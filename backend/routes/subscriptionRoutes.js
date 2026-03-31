import express from 'express';
import { createSubscription, getSubscriptions } from '../controllers/subscriptionController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
const router = express.Router();
router.post('/create', authenticate, authorize(['Customer']), createSubscription);
router.get('/', authenticate, authorize(['Customer']), getSubscriptions);
export default router;
