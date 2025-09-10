import express from 'express';
import { createLeaveReport, deleteLeaveReport, getLeaveReports, updateLeaveReport } from '../controllers/leaveController.js';

const router =  express.Router();


router.post('/', createLeaveReport);
router.get('/', getLeaveReports);
router.put('/:id', updateLeaveReport);
router.delete('/:id', deleteLeaveReport)



export default router;