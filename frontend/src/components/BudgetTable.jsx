import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const BudgetTable = ({ budgets, onEditEntry, onDeleteEntry }) => {
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-[1000px] w-full border-collapse text-sm">
        <thead className="bg-gray-100 font-semibold">
          <tr>
            <th className="p-3 whitespace-nowrap">Date</th>
            <th className="p-3 whitespace-nowrap">Party Name</th>
            <th className="p-3 whitespace-nowrap">Property Details</th>
            <th className="p-3 whitespace-nowrap">Amount Deposited</th>
            <th className="p-3 whitespace-nowrap">Stamp</th>
            <th className="p-3 whitespace-nowrap">Regi Fee</th>
            <th className="p-3 whitespace-nowrap">Misc Exp</th>
            <th className="p-3 whitespace-nowrap">Total Exp</th>
            <th className="p-3 whitespace-nowrap">Remaining</th>
            <th className="p-3 whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {budgets.map((b, budgetIdx) => {
            if (!b.propertyBudgets || b.propertyBudgets.length === 0) {
              const totalExp =
                (Number(b.stamp) || 0) +
                (Number(b.registrationFee) || 0) +
                (Number(b.officeMiscExpense) || 0);
              const remaining = 0 - totalExp;
              const date = b.date
                ? new Date(b.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                : '';
              return (
                <React.Fragment key={b._id}>
                  <tr className={`border-t ${budgetIdx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                    <td className="p-3 whitespace-nowrap">{date}</td>
                    <td className="p-3 whitespace-nowrap">{b.name}</td>
                    <td className="p-3 whitespace-nowrap">{b.propertyDetails || ''}</td>
                    <td className="p-3 whitespace-nowrap">0</td>
                    <td className="p-3 whitespace-nowrap">{b.stamp || ''}</td>
                    <td className="p-3 whitespace-nowrap">{b.registrationFee || ''}</td>
                    <td className="p-3 whitespace-nowrap">{b.officeMiscExpense || ''}</td>
                    <td className="p-3 whitespace-nowrap">{totalExp}</td>
                    <td className={`p-3 whitespace-nowrap ${
                      remaining < 0
                        ? "text-red-500"
                        : "text-green-500"

                    }`}>{remaining}</td>
                    <td className="p-3 whitespace-nowrap">
                      <button
                        className="text-blue-600 hover:underline mr-2"
                        onClick={() => onEditEntry(b, null, 0)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => onDeleteEntry(b, null, 0)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {/* Totals row for single entry */}
                  <tr className="font-bold bg-purple-100">
                    <td className="p-3 whitespace-nowrap" colSpan={3}>Total</td>
                    <td className="p-3 whitespace-nowrap">0</td>
                    <td className="p-3 whitespace-nowrap">{b.stamp || 0}</td>
                    <td className="p-3 whitespace-nowrap">{b.registrationFee || 0}</td>
                    <td className="p-3 whitespace-nowrap">{b.officeMiscExpense || 0}</td>
                    <td className="p-3 whitespace-nowrap">{totalExp}</td>
                    <td className={`p-3 whitespace-nowrap ${
                      remaining < 0
                        ? "text-red-500"
                        :  "text-green-500"
                        
                    }`}>{remaining}</td>
                    <td className="p-3 whitespace-nowrap"></td>
                  </tr>
                </React.Fragment>
              );
            }

            // Group propertyBudgets into blocks (each block starts with a deposit)
            const blocks = [];
            let currentBlock = [];
            b.propertyBudgets.forEach((entry, idx) => {
              if (entry.amount && Number(entry.amount) > 0) {
                if (currentBlock.length > 0) {
                  blocks.push(currentBlock);
                  currentBlock = [];
                }
              }
              currentBlock.push({ ...entry, idx });
              if (idx === b.propertyBudgets.length - 1) {
                blocks.push(currentBlock);
              }
            });

            // Totals for the entire budget
            let totalAmount = 0;
            let totalStamp = 0;
            let totalRegi = 0;
            let totalMisc = 0;
            let totalExp = 0;
            let sumOfRemaining = 0;

            // Render blocks
            const rows = [];
            blocks.forEach((block, blockIdx) => {
              let blockDeposit = 0;
              let blockBalance = 0;
              let blockRows = [];

              if (block[0].amount && Number(block[0].amount) > 0) {
                blockDeposit = Number(block[0].amount);
                totalAmount += blockDeposit;
                blockBalance = blockDeposit;
              }

              block.forEach((entry, i) => {
                const stamp = Number(entry.stamp) || 0;
                const registrationFee = Number(entry.registrationFee) || 0;
                const officeMiscExpense = Number(entry.officeMiscExpense) || 0;
                const rowTotalExp = stamp + registrationFee + officeMiscExpense;
                blockBalance -= rowTotalExp;

                // Add to totals
                totalStamp += stamp;
                totalRegi += registrationFee;
                totalMisc += officeMiscExpense;
                totalExp += rowTotalExp;

                const date = entry.date
                  ? new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                  : '';
                const showRemaining = (i === block.length - 1);
                if (showRemaining) sumOfRemaining += blockBalance;

                blockRows.push(
                  <tr key={entry._id || entry.idx}
                    className={`border-t ${blockIdx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                    <td className="p-3 whitespace-nowrap">{date}</td>
                    <td className="p-3 whitespace-nowrap">{b.name}</td>
                    <td className="p-3 whitespace-nowrap">{entry.propertyDetails}</td>
                    <td className="p-3 whitespace-nowrap">{entry.amount ? entry.amount : ''}</td>
                    <td className="p-3 whitespace-nowrap">{stamp}</td>
                    <td className="p-3 whitespace-nowrap">{registrationFee}</td>
                    <td className="p-3 whitespace-nowrap">{officeMiscExpense}</td>
                    <td className="p-3 whitespace-nowrap">{rowTotalExp}</td>
                    <td className={`p-3 whitespace-nowrap ${
                      blockBalance < 0
                        ? "text-red-500"
                        :  "text-green-500"

                    }`}>{showRemaining ? blockBalance : ''}</td>
                    <td className="p-3 whitespace-nowrap">
                      <button
                        className="text-blue-600 hover:underline mr-2"
                        onClick={() => onEditEntry(b, entry, entry.idx)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => onDeleteEntry(b, entry, entry.idx)}
                      >
                       <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              });

              rows.push(...blockRows);
            });

            // Totals row
            rows.push(
              <tr key="totals" className="font-bold bg-purple-100">
                <td className="p-3 whitespace-nowrap" colSpan={3}>Total</td>
                <td className="p-3 whitespace-nowrap">{totalAmount}</td>
                <td className="p-3 whitespace-nowrap">{totalStamp}</td>
                <td className="p-3 whitespace-nowrap">{totalRegi}</td>
                <td className="p-3 whitespace-nowrap">{totalMisc}</td>
                <td className="p-3 whitespace-nowrap">{totalExp}</td>
                <td className={`p-3 whitespace-nowrap ${
                  sumOfRemaining < 0
                    ? "text-red-500"
                    : "text-green-500"
                }`}>{sumOfRemaining}</td>
                <td className="p-3 whitespace-nowrap"></td>
              </tr>
            );
            return rows;
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BudgetTable;
