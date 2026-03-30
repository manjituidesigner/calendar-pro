import express from 'express';
import { addExpense, getMonthlyExpenses, getDailyExpenses } from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, addExpense);
router.get('/monthly', protect, getMonthlyExpenses);
router.get('/daily', protect, getDailyExpenses);

export default router;
