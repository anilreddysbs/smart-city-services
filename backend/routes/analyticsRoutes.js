import express from 'express';
import { getServiceDemand, getPlatformStats } from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/service-demand', authenticate, authorize(['Admin']), getServiceDemand);
router.get('/platform-stats', authenticate, authorize(['Admin']), getPlatformStats);
export default router;
