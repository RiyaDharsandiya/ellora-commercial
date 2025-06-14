import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BudgetTable from '../components/BudgetTable';
import AddPropertyBudget from '../components/AddPropertyBudget';
import BudgetCard from '../components/BudgetCard';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
const API_URL = import.meta.env.VITE_API_URL;

const BudgetDetails = () => {
  const { id } = useParams();
  const [budget, setBudget] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", amount: 0 });
  const [isEntryEditOpen, setIsEntryEditOpen] = useState(false);
  const [entryEditForm, setEntryEditForm] = useState({
    propertyDetails: "",
    amount: "",
    stamp: "",
    registrationFee: "",
    officeMiscExpense: "",
  });
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => {
    if (id) fetchBudget();
  }, [id]);

  useEffect(() => {
    if (budget) {
      setEditForm({
        name: budget.name,
        amount: budget.amount,
      });
    }
  }, [budget]);

  const fetchBudget = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/budgets/getBudget/${id}`);
      setBudget(res.data);
    } catch (error) {
      console.error('Error fetching budget:', error);
    }
  };

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
    if (!budget || !budget.propertyBudgets) return [];
    return budget.propertyBudgets.filter(entry => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getMonth() === currentDate.getMonth() &&
        entryDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const monthlyEntries = getMonthlyEntries();
  const monthlySpending = monthlyEntries.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const remaining = budget ? budget.amount - monthlySpending : 0;

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");
      const updateData = {
        name: editForm.name,
        amount: editForm.amount,
      };
      const res = await axios.put(
        `${API_URL}/api/budgets/updateBudget/${id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBudget(res.data);
      setIsEditOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(
        `${API_URL}/api/budgets/deleteBudget/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = "/budget";
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  const handleEditEntry = (budget, entry) => {
    setEditingEntry({ budget, entry });
    setEntryEditForm({
      propertyDetails: entry.propertyDetails || "",
      amount: entry.amount || 0,
      stamp: entry.stamp || 0,
      registrationFee: entry.registrationFee || 0,
      officeMiscExpense: entry.officeMiscExpense || 0,
    });
    setIsEntryEditOpen(true);
  };

  const handleDeleteEntry = async (budget, entry) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(
        `${API_URL}/api/budgets/deletePropertyBudgetEntry/${budget._id}/${entry._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBudget();
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  const handleEntryEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");
      const { budget, entry } = editingEntry;
      await axios.put(
        `${API_URL}/api/budgets/updatePropertyBudgetEntry/${budget._id}/${entry._id}`,
        entryEditForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEntryEditOpen(false);
      fetchBudget();
    } catch (error) {
      alert(error.response?.data?.message || "Update failed");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEntryEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewBudget = (newBudget) => {
    setBudget(newBudget);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Party Details</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-4">
          {budget ? (
            <>
              <BudgetCard
                budget={budget}
                onEdit={() => setIsEditOpen(true)}
                onDelete={handleDelete}
                showActions={true}
              />
              {
              isEditOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                  <div className="bg-white rounded-xl p-6 w-96">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Edit Party</h2>
                      <button onClick={() => setIsEditOpen(false)} className="text-gray-400 text-xl">&times;</button>
                    </div>
                    <form onSubmit={handleEditSubmit}>
                      <label className="block font-medium mb-1">Name:</label>
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        className="w-full border rounded p-2 mb-4"
                      />
                      <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded w-full">Save</button>
                    </form>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>Loading budget...</div>
          )}
        </div>

        <div className="h-full">
          {budget && (
            <AddPropertyBudget
              onCreated={handleNewBudget}
              budgetId={budget._id}
              initialData={budget}
              onUpdated={handleNewBudget}
            />
          )}
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4 mt-10">
        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full">
          <FaChevronLeft />
        </button>
        <h3 className="text-xl font-semibold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full">
          <FaChevronRight />
        </button>
      </div>

      {/* Budget Table */}
      <div className="mt-10">
        <BudgetTable
          budgets={budget ? [{ ...budget, propertyBudgets: monthlyEntries }] : []}
          onEditEntry={handleEditEntry}
          onDeleteEntry={handleDeleteEntry}
          expenses={monthlyEntries}
        />

        {isEntryEditOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit Party Deatils </h2>
                <button onClick={() => setIsEntryEditOpen(false)} className="text-gray-400 text-xl">&times;</button>
              </div>
              <form onSubmit={handleEntryEditSubmit}>
                <label className="block font-medium mb-1">Property Details:</label>
                <input
                  type="text"
                  name="propertyDetails"
                  value={entryEditForm.propertyDetails}
                  onChange={handleChange}
                  className="w-full border rounded p-2 mb-4"
                />
                <label className="block font-medium mb-1">Amount Deposited:</label>
                <input
                  name="amount"
                  type="number"
                  min="0"
                  value={entryEditForm.amount}
                  onChange={handleChange}
                  className="w-full border rounded p-2 mb-4"
                />
                <label className="block font-medium mb-1">Stamp:</label>
                <input
                  type="number"
                  name="stamp"
                  value={entryEditForm.stamp}
                  onChange={handleChange}
                  className="w-full border rounded p-2 mb-4"
                />
                <label className="block font-medium mb-1">Registration Fee:</label>
                <input
                  type="number"
                  name="registrationFee"
                  value={entryEditForm.registrationFee}
                  onChange={handleChange}
                  className="w-full border rounded p-2 mb-4"
                />
                <label className="block font-medium mb-1">Misc Expense:</label>
                <input
                  type="number"
                  name="officeMiscExpense"
                  value={entryEditForm.officeMiscExpense}
                  onChange={handleChange}
                  className="w-full border rounded p-2 mb-4"
                />
                <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded w-full">Save</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
    </main>
    <footer className="bg-white text-center text-gray-500 p-4 text-sm shadow-inner">
    &copy; {new Date().getFullYear()} Ellora commercial . Created by Riya
  </footer>
</div>
  );
};

export default BudgetDetails;
