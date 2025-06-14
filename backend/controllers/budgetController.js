import Budget from '../models/Budget.js';
import {recalculateBudgetTotals} from '../middlewares/recalTotal.js'
import mongoose from 'mongoose';

export const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgets = await Budget.find({ user: userId }).sort({ date: -1 });
    return res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const createBudget = async (req, res) => {
  try {
    const { name, amount, spent, propertyDetails, stamp, registrationFee, officeMiscExpense } = req.body;
    const userId = req.user.id; // comes from auth middleware
    const budget = new Budget({
      name,
      amount:amount?amount:0,
      spent,
      propertyDetails,
      stamp:stamp?stamp:0,
      registrationFee:registrationFee?registrationFee:0,
      officeMiscExpense:officeMiscExpense?officeMiscExpense:0,
      user: userId,
    });

    await budget.save();
    return res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single budget by its ID
export const getBudgetById = async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await Budget.findById(id).populate('user', 'name email');
    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// controllers/budgetController.js
export const updateBudget = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const budget = await Budget.findById(id);
    if (!budget) return res.status(404).json({ message: "Budget not found" });
    if (String(budget.user) !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    // Only update fields that are present in req.body
    Object.keys(req.body).forEach((key) => {
      budget[key] = req.body[key];
    });

    await budget.save();
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Delete budget (only owner can delete)
export const deleteBudget = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const budget = await Budget.findById(id);
    if (!budget) return res.status(404).json({ message: "Budget not found" });

    // Only allow owner
    if (String(budget.user) !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    await budget.deleteOne();
    res.json({ message: "Budget deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



//add property details in budget

export const addPropertyBudget = async (req, res) => {
  try {
    const { propertyDetails, amount, stamp, registrationFee, officeMiscExpense, date } = req.body;
    const { budgetId } = req.params;
    const userId = req.user.id;

    if (!propertyDetails || !amount || !date) {
      return res.status(400).json({ error: 'Property details, amount, and date are required' });
    }

    const budget = await Budget.findOne({ _id: budgetId, user: userId });
    if (!budget) return res.status(404).json({ error: 'Budget not found' });

    budget.propertyBudgets.push({
      propertyDetails,
      stamp: stamp ? Number(stamp) : 0,
      registrationFee: registrationFee ? Number(registrationFee) : 0,
      officeMiscExpense: officeMiscExpense ? Number(officeMiscExpense) : 0,
      amount: Number(amount),
      date: new Date(date),
    });

    await budget.save();
    return res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Delete a propertyBudget entry by entry._id
export const deletePropertyBudgetEntry = async (req, res) => {
  const { budgetId, entryId } = req.params;
  const userId = req.user.id;

  try {
    const budget = await Budget.findById(budgetId);
    if (!budget) return res.status(404).json({ message: "Budget not found" });
    if (String(budget.user) !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    // Remove the entry
    budget.propertyBudgets = budget.propertyBudgets.filter(
      (entry) => String(entry._id) !== entryId
    );

    // Recalculate totals
    recalculateBudgetTotals(budget);

    await budget.save();
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE entry
export const updatePropertyBudgetEntry = async (req, res) => {
  const { budgetId, entryId } = req.params;
  const userId = req.user.id;
  const { propertyDetails, stamp, registrationFee, officeMiscExpense, amount } = req.body;

  try {
    const budget = await Budget.findById(budgetId);
    if (!budget) return res.status(404).json({ message: "Budget not found" });
    if (String(budget.user) !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    const entry = budget.propertyBudgets.id(entryId);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    entry.propertyDetails = propertyDetails;
    entry.stamp = stamp;
    entry.registrationFee = registrationFee;
    entry.officeMiscExpense = officeMiscExpense;
    if (amount !== undefined) entry.amount = amount;

    // Recalculate totals
    recalculateBudgetTotals(budget);

    await budget.save();
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMonthlyRemaining = async (req, res) => {
  try {
    const userId = req.user.id;

    const monthlyRemaining = await Budget.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId)} },
      { $unwind: "$propertyBudgets" },
      {
        $group: {
          _id: {
            year: { $year: "$propertyBudgets.date" },
            month: { $month: "$propertyBudgets.date" }
          },
          totalRemaining: {
            $sum: {
              $subtract: [
                "$propertyBudgets.amount",
                {
                  $add: [
                    { $ifNull: ["$propertyBudgets.stamp", 0] },
                    { $ifNull: ["$propertyBudgets.registrationFee", 0] },
                    { $ifNull: ["$propertyBudgets.officeMiscExpense", 0] }
                  ]
                }
              ]
            }
          }            
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    res.status(200).json(monthlyRemaining);
  } catch (error) {
    console.error('Error in getMonthlyRemaining:', error);
    res.status(500).json({ error: error.message });
  }
};
