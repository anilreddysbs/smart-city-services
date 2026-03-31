import express from 'express';
import { getPerformance } from '../controllers/performanceController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/', authenticate, authorize(['Worker']), getPerformance);
export default router;
