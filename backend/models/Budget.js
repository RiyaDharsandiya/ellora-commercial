import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  spent: { type: Number, default: 0 },
  totalExp: { type: Number, default: 0 },
  remaining: { type: Number, default: 0 },
  totalAmount:{type: Number, default: 0 },
  propertyBudgets: [
    {
      propertyDetails: String,
      stamp: Number,
      registrationFee: Number,
      officeMiscExpense: Number,
      amount: {type: Number, default: 0 },
      date: { type: Date }
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Budget = mongoose.model('Budget', BudgetSchema);
export default Budget;

