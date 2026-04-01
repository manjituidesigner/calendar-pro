import express from 'express';
import { addExpense, getMonthlyExpenses, getDailyExpenses, updateExpense, deleteExpense } from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, addExpense);
router.get('/monthly', protect, getMonthlyExpenses);
router.get('/daily', protect, getDailyExpenses);

router.route('/:id')
  .put(protect, updateExpense)
  .delete(protect, deleteExpense);

export default router;
