import { addExpense, getMonthlyExpenses, getDailyExpenses, updateExpense, deleteExpense, getPeoples, getSummary } from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, addExpense);
router.get('/monthly', protect, getMonthlyExpenses);
router.get('/daily', protect, getDailyExpenses);
router.get('/peoples', protect, getPeoples);
router.get('/summary', protect, getSummary);

router.route('/:id')
  .put(protect, updateExpense)
  .delete(protect, deleteExpense);

export default router;
