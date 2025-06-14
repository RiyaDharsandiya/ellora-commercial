export function recalculateBudgetTotals(budget) {
    // Sum of all deposits (amounts)
    budget.totalAmount = budget.propertyBudgets.reduce(
      (sum, entry) => sum + (Number(entry.amount) || 0),
      0
    );
  
    // Sum of all expenses
    budget.totalExp = budget.propertyBudgets.reduce(
      (sum, entry) =>
        sum +
        (Number(entry.stamp) || 0) +
        (Number(entry.registrationFee) || 0) +
        (Number(entry.officeMiscExpense) || 0),
      0
    );
  
    // Remaining = totalAmount - totalExp
    budget.remaining = budget.totalAmount - budget.totalExp;
  }
  