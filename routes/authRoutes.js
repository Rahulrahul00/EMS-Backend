//API endpoints
import express from 'express';
import { registerUser, loginUser, getProfile, verifyEmail } from '../controllers/authController.js';

const router = express.Router();

//Routes
router.post('/register', registerUser);
router.get('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.get('/profile', getProfile);

export default router;