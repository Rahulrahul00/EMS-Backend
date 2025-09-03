// API endpoints

import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '../controllers/employeeController.js';

const router = express.Router();

router.get('/', authenticateToken, getEmployees);
router.post('/', authenticateToken, addEmployee);
router.put('/:id', authenticateToken, updateEmployee);
router.delete('/:id', authenticateToken, deleteEmployee);

export default router;


