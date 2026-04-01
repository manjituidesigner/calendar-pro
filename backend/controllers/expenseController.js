import Expense from '../models/Expense.js';

export const addExpense = async (req, res) => {
  try {
    const { 
      date, time, type, payeeName, category, subCategory, 
      paymentStatus, paymentMethod, items, 
      lenDenType, partyName, notes, totalAmount 
    } = req.body;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Invalid date format. Expected YYYY-MM-DD." });
    }

    const expense = new Expense({
      userId: req.user._id,
      date, time, type, payeeName, category, subCategory, 
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

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      date, time, type, payeeName, category, subCategory, 
      paymentStatus, paymentMethod, items, 
      lenDenType, partyName, notes, totalAmount 
    } = req.body;

    const expense = await Expense.findOne({ _id: id, userId: req.user._id });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }

    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Invalid date format. Expected YYYY-MM-DD." });
    }

    expense.date = date || expense.date;
    expense.time = time !== undefined ? time : expense.time;
    expense.type = type || expense.type;
    expense.payeeName = payeeName !== undefined ? payeeName : expense.payeeName;
    expense.category = category !== undefined ? category : expense.category;
    expense.subCategory = subCategory !== undefined ? subCategory : expense.subCategory;
    expense.paymentStatus = paymentStatus || expense.paymentStatus;
    expense.paymentMethod = paymentMethod || expense.paymentMethod;
    expense.items = items || expense.items;
    expense.lenDenType = lenDenType || expense.lenDenType;
    expense.partyName = partyName !== undefined ? partyName : expense.partyName;
    expense.notes = notes !== undefined ? notes : expense.notes;
    expense.totalAmount = totalAmount !== undefined ? totalAmount : expense.totalAmount;

    await expense.save();
    res.status(200).json({ message: "Expense updated successfully.", expense });
  } catch (error) {
    res.status(500).json({ message: "Failed to update expense", error: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }

    res.status(200).json({ message: "Expense deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete expense", error: error.message });
  }
};

export const getPeoples = async (req, res) => {
  try {
    const expenses = await Expense.find({
      userId: req.user._id,
      type: 'LenDen'
    });

    const peopleMap = {};
    expenses.forEach(exp => {
      const name = exp.partyName || 'Unknown';
      if (!peopleMap[name]) {
        peopleMap[name] = { 
          name, 
          balance: 0, 
          synced: true, 
          type: 'Party',
          mobile: 'N/A',
          city: 'N/A'
        };
      }
      if (exp.lenDenType === 'I GAVE') {
        peopleMap[name].balance += exp.totalAmount;
      } else if (exp.lenDenType === 'I TOOK') {
        peopleMap[name].balance -= exp.totalAmount;
      }
    });

    res.status(200).json(Object.values(peopleMap));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch peoples", error: error.message });
  }
};

export const getSummary = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id });
    
    let totalCredit = 0; // To Receive (I GAVE)
    let totalDebit = 0;  // To Pay (I TOOK)
    
    expenses.forEach(exp => {
      if (exp.type === 'LenDen') {
        if (exp.lenDenType === 'I GAVE') totalCredit += exp.totalAmount;
        if (exp.lenDenType === 'I TOOK') totalDebit += exp.totalAmount;
      }
    });

    res.status(200).json({ totalCredit, totalDebit });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch summary", error: error.message });
  }
};
