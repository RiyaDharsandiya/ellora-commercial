import React from "react";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";

const BudgetCard = ({
  budget,
  onEdit,
  onDelete,
  onViewDetails,
  showActions = false,
  showViewDetails = false,
}) => {
  if (!budget) return null;

  const totalExp = typeof budget.totalExp === "number"
    ? budget.totalExp
    : Number(budget.spent) || 0;
  const remaining = typeof budget.remaining === "number"
    ? budget.remaining
    : (Number(budget.amount) || 0) - totalExp;
  const progress = Number(budget.totalAmount)
    ? Math.min((totalExp / Number(budget.totalAmount)) * 100, 100)
    : 0;

  return (
    <div className="border rounded-lg p-4 shadow">
      <div className="flex items-center mb-2">
        <span className="text-2xl">💸</span>
        <h2 className="ml-2 text-lg font-bold">{budget.name?.toUpperCase()}</h2>
      </div>
      <div className="text-sm mt-2">Rs {totalExp} spent</div>
      <div className="bg-gray-200 h-2 rounded mt-1 mb-2">
        <div
          className="bg-black h-2 rounded"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div
          className={`text-sm ${
            remaining < 0
              ? "text-red-500"
              : remaining === 0
              ? "text-green-500"
              : "text-gray-500"
          }`}
        >
          Rs {remaining.toFixed(2)} remaining
        </div>



      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        {showViewDetails && (
          <button
          onClick={onViewDetails}
          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded transition"
        >
          <FaEye />
          <span className="text-sm">View Details</span>
        </button>
        )}
        {showActions && (
          <>
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              onClick={onEdit}
            >
              <div className="flex justify-center items-center">
             <div className="pr-3">Edit</div> 
             <div> <FaEdit size={15}/></div>
              </div>
            </button>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              onClick={onDelete}
            >
              <div className="flex justify-center items-center">
             <div className="pr-3">Delete</div> 
             <div> <FaTrash size={15}/></div>
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BudgetCard;
