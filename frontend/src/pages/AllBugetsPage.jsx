import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight, FaEdit, FaTrash } from 'react-icons/fa';
import * as XLSX from 'xlsx';
const API_URL = import.meta.env.VITE_API_URL;

export default function AllBudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchBudgets = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/budgets/getBudget`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBudgets(res.data);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
    }
  };
  useEffect(() => {
    fetchBudgets();
  }, []);

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const getMonthlyEntries = () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    let allEntries = [];
    let unsettledEntries = [];

    budgets.forEach(budget => {
      if (budget.propertyBudgets && budget.propertyBudgets.length > 0) {
        budget.propertyBudgets.forEach(entry => {
          const entryDate = new Date(entry.date);
          const stamp = Number(entry.stamp) || 0;
          const registrationFee = Number(entry.registrationFee) || 0;
          const officeMisc = Number(entry.officeMiscExpense) || 0;
          const totalExp = stamp + registrationFee + officeMisc;
          const remaining = (Number(entry.amount) || 0) - totalExp;

          if (entryDate.getMonth() === month && entryDate.getFullYear() === year) {
            allEntries.push({
              ...entry,
              budgetName: budget.name,
              budgetId: budget._id,
              isUnsettled: false,
            });
          } else if (
            entryDate.getMonth() < month &&
            entryDate.getFullYear() <= year &&
            remaining !== 0
          ) {
            unsettledEntries.push({
              ...entry,
              budgetName: budget.name,
              budgetId: budget._id,
              isUnsettled: true,
            });
          }
        });
      }
    });

    return [...allEntries, ...unsettledEntries];
  };

  const monthlyEntries = getMonthlyEntries();

  // Calculate totals for each column
  const totalAmount = monthlyEntries.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const totalStamp = monthlyEntries.reduce((sum, entry) => sum + (Number(entry.stamp) || 0), 0);
  const totalRegistrationFee = monthlyEntries.reduce((sum, entry) => sum + (Number(entry.registrationFee) || 0), 0);
  const totalOfficeMiscExpense = monthlyEntries.reduce((sum, entry) => sum + (Number(entry.officeMiscExpense) || 0), 0);
  const totalExpense = totalStamp + totalRegistrationFee + totalOfficeMiscExpense;
  const totalRemaining = totalAmount - totalExpense;


  //edit delete
  const EditModal = ({ entry, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      date: entry.date.split('T')[0],
      amount: entry.amount,
      stamp: entry.stamp,
      registrationFee: entry.registrationFee,
      officeMiscExpense: entry.officeMiscExpense,
      propertyDetails: entry.propertyDetails
    });
  
    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
      onClose();
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Edit Entry</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  step="0.01"
                  required
                />
              </div>
              <div>
              <label className="block text-sm font-medium mb-1">Stamp</label>
              <input
                type="number"
                name="stamp"
                value={formData.stamp}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Registration Fee</label>
              <input
                type="number"
                name="registrationFee"
                value={formData.registrationFee}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Office Misc Expense</label>
              <input
                type="number"
                name="officeMiscExpense"
                value={formData.officeMiscExpense}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Property Details</label>
              <textarea
                name="propertyDetails"
                value={formData.propertyDetails}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows="3"
              />
            </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    setEditModalOpen(true);
  };

  const handleDelete = async (budgetId, entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const token = sessionStorage.getItem('token');
        await axios.delete(
          `${API_URL}/api/budgets/deletePropertyBudgetEntry/${budgetId}/${entryId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchBudgets(); // Refresh data
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleSave = async (updatedData) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/budgets/updatePropertyBudgetEntry/${selectedEntry.budgetId}/${selectedEntry._id}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBudgets(); // Refresh data
    } catch (error) {
      console.error('Update failed:', error);
    }
  };


  //excel
  const exportToExcel = () => {
    const dataToExport = monthlyEntries.map(entry => {
      const stamp = Number(entry.stamp) || 0;
      const registrationFee = Number(entry.registrationFee) || 0;
      const officeMisc = Number(entry.officeMiscExpense) || 0;
      const totalExpense = stamp + registrationFee + officeMisc;
      const remaining = (Number(entry.amount) || 0) - totalExpense;
  
      return {
        'Budget Name': entry.budgetName,
        'Date': new Date(entry.date).toLocaleDateString(),
        'Amount': Number(entry.amount).toFixed(2),
        'Stamp': stamp.toFixed(2),
        'Registration Fee': registrationFee.toFixed(2),
        'Office Misc': officeMisc.toFixed(2),
        'Total Expense': totalExpense.toFixed(2),
        'Remaining': remaining.toFixed(2),
        'Status': entry.isUnsettled ? 'Unsettled' : 'Settled'
      };
    });

    const totalsRow = {
    'Budget Name': 'Total',
    'Date': '',
    'Amount': totalAmount.toFixed(2),
    'Stamp': totalStamp.toFixed(2),
    'Registration Fee': totalRegistrationFee.toFixed(2),
    'Office Misc': totalOfficeMiscExpense.toFixed(2),
    'Total Expense': totalExpense.toFixed(2),
    'Remaining': totalRemaining.toFixed(2),
    'Status': '',
  };

  dataToExport.push(totalsRow);
  
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Budget');
  
    XLSX.writeFile(workbook, `Budget_${currentDate.toLocaleDateString('en-GB', {
      month: 'short', year: 'numeric'
    }).replace(/\s/g, '_')}.xlsx`);
  };
  return (
    <div className='flex flex-col'>
    <main className="flex-grow">
    <div className="p-4 md:p-6 min-h-screen">
      {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6 mt-4 md:mt-10">
        {/* Empty spacer on the left */}
        <div className="w-8" />
        {/* Month navigation (centered) */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FaChevronLeft />
          </button>
          <h3 className="text-xl font-semibold">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FaChevronRight />
          </button>
        </div>
        {/* Export button on the right */}
        <div>
          <button
            onClick={exportToExcel}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export to Excel
          </button>
        </div>
      </div>

    


      {/* Table Wrapper */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">Party Name</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">Date</th>
              <th className="p-3 text-right text-sm font-semibold text-gray-700 border-b">Amount</th>
              <th className="p-3 text-right text-sm font-semibold text-gray-700 border-b">Stamp</th>
              <th className="p-3 text-right text-sm font-semibold text-gray-700 border-b">Registration Fee</th>
              <th className="p-3 text-right text-sm font-semibold text-gray-700 border-b">Office Misc</th>
              <th className="p-3 text-right text-sm font-semibold text-gray-700 border-b">Total Expense</th>
              <th className="p-3 text-right text-sm font-semibold text-gray-700 border-b">Remaining</th>
              <th className="p-3 text-sm font-semibold text-gray-700 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
          {monthlyEntries.map((entry, index) => {
            const stamp = Number(entry.stamp) || 0;
            const registrationFee = Number(entry.registrationFee) || 0;
            const officeMisc = Number(entry.officeMiscExpense) || 0;
            const totalExp = stamp + registrationFee + officeMisc;
            const remaining = (Number(entry.amount) || 0) - totalExp;
            const bgColor = entry.isUnsettled
              ? "bg-red-100"
              : index % 2 === 0
              ? "bg-gray-50"
              : "bg-white";
            return (
              <tr
                key={index}
                className={`${bgColor} hover:bg-gray-100`}
              >
                <td className="p-3 border-b border-gray-100">{entry.budgetName}</td>
                <td className="p-3 border-b border-gray-100">
                  {new Date(entry.date).toLocaleDateString()}
                  {entry.isUnsettled && (
                    <span className="ml-2 text-xs text-red-600">
                      (Unsettled from previous month)
                    </span>
                  )}
                </td>
                <td className="p-3 border-b border-gray-100 text-right">{Number(entry.amount).toFixed(2)}</td>
                <td className="p-3 border-b border-gray-100 text-right">{stamp.toFixed(2)}</td>
                <td className="p-3 border-b border-gray-100 text-right">{registrationFee.toFixed(2)}</td>
                <td className="p-3 border-b border-gray-100 text-right">{officeMisc.toFixed(2)}</td>
                <td className="p-3 border-b border-gray-100 text-right">{totalExp.toFixed(2)}</td>
                <td
                  className={`p-3 border-b border-gray-100 text-right ${
                    remaining < 0
                      ? "text-red-500 font-semibold"
                      : remaining === 0
                      ? "text-green-500 font-semibold"
                      : "text-gray-700 font-semibold"
                  }`}
                >
                  {remaining.toFixed(2)}
                </td>
                {/* Add Actions Column */}
                <td className="p-3 border-b border-gray-100">
                  <div className="flex space-x-2 justify-center">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.budgetId, entry._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-gray-100">
          <tr>
              <td className="p-3 font-semibold border-t" colSpan="2">Total</td>
              <td className="p-3 font-semibold border-t text-right">{totalAmount.toFixed(2)}</td>
              <td className="p-3 font-semibold border-t text-right">{totalStamp.toFixed(2)}</td>
              <td className="p-3 font-semibold border-t text-right">{totalRegistrationFee.toFixed(2)}</td>
              <td className="p-3 font-semibold border-t text-right">{totalOfficeMiscExpense.toFixed(2)}</td>
              <td className="p-3 font-semibold border-t text-right">{totalExpense.toFixed(2)}</td>
              <td
              className={`p-3 font-semibold border-t text-right ${
                  totalRemaining < 0
                  ? "text-red-500"
                  : totalRemaining === 0
                  ? "text-green-500"
                  : "text-black"
              }`}
              >
              {totalRemaining.toFixed(2)}
              </td>
              <td className="p-3 font-semibold border-t"></td>
          </tr>
        </tfoot>
      </table>
    </div>

    {/* Add Edit Modal at the bottom */}
    {editModalOpen && (
      <EditModal
        entry={selectedEntry}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSave}
      />
    )}</div>
      </main>
      <footer className="bg-white text-center text-gray-500 p-4 text-sm shadow-inner">
        &copy; {new Date().getFullYear()} Ellora commercial . Created by Riya
      </footer>
    </div>
);
}
