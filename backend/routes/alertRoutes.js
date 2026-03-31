import express from 'express';
import { getAlerts, generateAlerts } from '../controllers/alertController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/alerts', authenticate, authorize(['Worker']), getAlerts);
router.post('/generate', authenticate, authorize(['Admin']), generateAlerts);
export default router;
