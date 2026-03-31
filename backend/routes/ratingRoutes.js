import express from 'express';
import { createRating } from '../controllers/ratingController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, createRating);

export default router;
