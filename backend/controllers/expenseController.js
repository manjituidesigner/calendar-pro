import Expense from '../models/Expense.js';

export const addExpense = async (req, res) => {
  try {
    const { 
      date, type, payeeName, category, subCategory, 
      paymentStatus, paymentMethod, items, 
      lenDenType, partyName, notes, totalAmount 
    } = req.body;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Invalid date format. Expected YYYY-MM-DD." });
    }

    const expense = new Expense({
      userId: req.user._id,
      date, type, payeeName, category, subCategory, 
      paymentStatus, paymentMethod, items, 
      lenDenType, partyName, notes, totalAmount
    });

    await expense.save();
    res.status(201).json({ message: "Expense saved successfully.", expense });
  } catch (error) {
    res.status(500).json({ message: "Failed to save expense", error: error.message });
  }
};

export const getMonthlyExpenses = async (req, res) => {
  try {
    const { month } = req.query; // Expected: YYYY-MM
    
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: "Invalid month format. Expected YYYY-MM." });
    }

    const regex = new RegExp(`^${month}`);
    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $regex: regex }
    });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch monthly expenses", error: error.message });
  }
};

export const getDailyExpenses = async (req, res) => {
  try {
    const { date } = req.query; // Expected: YYYY-MM-DD
    
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Invalid date format. Expected YYYY-MM-DD." });
    }

    const expenses = await Expense.find({
      userId: req.user._id,
      date: date
    }).sort({ createdAt: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch daily expenses", error: error.message });
  }
};
