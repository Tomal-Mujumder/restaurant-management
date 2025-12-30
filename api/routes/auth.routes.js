import express from 'express';
import { google, signin, signup, verifyOTP, resendOTP, forgotPassword, resetPassword } from '../controllers/auth.controller.js';

const router = express.Router();


router.post('/signup', signup );
router.post('/signin', signin);
router.post('/google', google);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;