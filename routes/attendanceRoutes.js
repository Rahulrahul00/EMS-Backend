// API endpoints

import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { addAttendance, exportEmployeeReport, getAttandance, getAttandanceReport, getEmployeeReport } from '../controllers/attendanceController.js';

const router = express.Router();

router.post('/', authenticateToken, addAttendance);
router.get('/', authenticateToken, getAttandance );
router.get('/report', authenticateToken, getAttandanceReport);
router.get('/employee-report', authenticateToken, getEmployeeReport);
router.get('/employee-report/export', authenticateToken, exportEmployeeReport);



export default router;