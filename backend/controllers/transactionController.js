import Transaction from '../models/Transaction.js';

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res) => {
  try {
    const { 
      type, amount, date, payeeOrParty, 
      category, subCategory, items, paymentStatus, method, 
      lenDenType, notes 
    } = req.body;

    const transaction = new Transaction({
      user: req.user._id,
      type,
      amount,
      date,
      payeeOrParty,
      category,
      subCategory,
      items,
      paymentStatus,
      method,
      lenDenType,
      notes
    });

    const createdTransaction = await transaction.save();
    res.status(201).json(createdTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all transactions for user
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (transaction && transaction.user.toString() === req.user._id.toString()) {
      await transaction.deleteOne();
      res.json({ message: 'Transaction removed' });
    } else {
      res.status(404).json({ message: 'Transaction not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res) => {
  try {
    const { 
      type, amount, date, payeeOrParty, 
      category, subCategory, items, paymentStatus, method, 
      lenDenType, notes 
    } = req.body;

    const transaction = await Transaction.findById(req.params.id);

    if (transaction && transaction.user.toString() === req.user._id.toString()) {
      transaction.type = type || transaction.type;
      transaction.amount = amount !== undefined ? amount : transaction.amount;
      transaction.date = date || transaction.date;
      transaction.payeeOrParty = payeeOrParty || transaction.payeeOrParty;
      transaction.category = category || transaction.category;
      transaction.subCategory = subCategory || transaction.subCategory;
      transaction.items = items || transaction.items;
      transaction.paymentStatus = paymentStatus || transaction.paymentStatus;
      transaction.method = method || transaction.method;
      transaction.lenDenType = lenDenType || transaction.lenDenType;
      transaction.notes = notes || transaction.notes;

      const updatedTransaction = await transaction.save();
      res.json(updatedTransaction);
    } else {
      res.status(404).json({ message: 'Transaction not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
