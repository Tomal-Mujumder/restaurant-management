import express from 'express';
import { createReview, getReviewsByFoodId, deleteReview } from '../controllers/review.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, createReview);
router.get('/:foodId', getReviewsByFoodId);
router.delete('/:reviewId', verifyToken, deleteReview);

export default router;
