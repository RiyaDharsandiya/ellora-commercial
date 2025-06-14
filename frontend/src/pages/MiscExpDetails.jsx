import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import BudgetSummaryTable from '../components/BudgetSummaryTable';
import { FaChevronLeft, FaChevronRight, FaEdit, FaTrash } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
const API_URL = import.meta.env.VITE_API_URL;

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function MiscExpDetails() {
  const { id } = useParams();
  const [miscExp, setMiscExp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthlyData, setMonthlyData] = useState([]);
  const [expName, setExpName] = useState('');
  const [amount, setAmount] = useState('');


  const fetchMonthlyData = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const [miscExpRes, budgetRes] = await Promise.all([
        axios.get(`${API_URL}/api/miscexp/monthly`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/budgets/monthly-remaining`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      const combined = monthNames.map((month, idx) => ({
        month,
        miscExp: miscExpRes.data.find(d => d._id.month === idx + 1)?.totalMiscExp || 0,
        remaining: budgetRes.data.find(d => d._id.month === idx + 1)?.totalRemaining || 0
      }));
      setMonthlyData(combined);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    }
  };

  const fetchMiscExp = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/miscexp/${id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });
      setMiscExp(res.data);
    } catch (error) {
      console.error("Failed to fetch MiscExp details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyData();
    fetchMiscExp();
  }, [id]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!expName || !amount) return;

    try {
      const res = await axios.put(
        `${API_URL}/api/miscexp/${id}/addEntry`,
        {
          data: { [expName]: amount },
          date: currentDate,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        }
      );
      setMiscExp(res.data.miscExp);
      setExpName('');
      setAmount('');
      fetchMonthlyData();
    } catch (error) {
      console.error("Failed to add MiscExp entry:", error);
    }
  };

  const filterEntriesByMonthYear = (entries, date) => {
    if (!entries || !Array.isArray(entries)) return [];
    const targetMonth = date.getMonth();
    const targetYear = date.getFullYear();
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === targetMonth && entryDate.getFullYear() === targetYear;
    });
  };

  const currentEntries = filterEntriesByMonthYear(miscExp?.entries, currentDate);
  const currentData = {};
  let currentTotal = 0;
  currentEntries.forEach(entry => {
    if (entry.data && typeof entry.data === 'object') {
      for (const [key, value] of Object.entries(entry.data)) {
        currentData[key] = (currentData[key] || 0) + Number(value);
        currentTotal += Number(value);
      }
    }
  });

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!miscExp) return <div className="text-center text-red-500 py-10">MiscExp not found.</div>;
  
  const handleDelete = async (category) => {
    if (!window.confirm(`Delete "${category}" entry?`)) return;
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.delete(
        `${API_URL}/api/miscexp/delete-entry`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { category }, // Axios DELETE uses data for body
        }
      );
      if (response.data.success) {
        toast.success('Entry deleted successfully');
        fetchMiscExp();
        fetchMonthlyData();
      } else {
        toast.error(response.data.message || 'Failed to delete entry');
      }
    } catch (error) {
      toast.error('Error deleting entry');
      console.error('Error:', error);
    }
  };
  
  return (
  <div className="min-h-screen flex flex-col">
  <main className="flex-grow">
    <div className="p-4 sm:p-6 lg:p-8 space-y-10">
      <Toaster />
      {/* Month Navigation */}
      <div className="flex justify-center items-center gap-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <FaChevronLeft />
        </button>
        <h2 className="text-xl sm:text-2xl font-semibold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <FaChevronRight />
        </button>
      </div>
  
      {/* Top Grid: Form and Table side by side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Add Misc Expense Form */}
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h2 className="text-xl font-semibold mb-4">Add Misc Expense</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Expense Name</label>
              <input
                type="text"
                value={expName}
                onChange={(e) => setExpName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Add Entry
            </button>
          </form>
        </div>
  
        {/* Expenses Summary Table */}
        <div className="bg-white p-6 rounded-xl shadow-md border overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4">Expenses Summary</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border-b">Category</th>
                <th className="p-2 border-b text-right">Amount</th>
                <th className="p-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
            {Object.entries(currentData).map(([key, value]) => (
      <tr key={key} className="border-b last:border-b-0">
        <td className="p-3 border-b border-gray-200">{key}</td>
        <td className="p-3 border-b border-gray-200 text-right">₹{value}</td>
        <td className="p-3 border-b border-gray-200 ">
          <button
            onClick={() => handleDelete(key)}
            className="inline-flex items-center justify-center text-red-600 hover:text-red-800"
            title="Delete"
          >
            <FaTrash />
          </button>
        </td>
      </tr>
    ))}

              <tr className="font-semibold text-black">
                <td className="p-2 text-right">Total</td>
                <td className="p-2 text-right">₹{currentTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      {/* Monthly Budget Summary (Placed Below) */}
      <div className="bg-white p-6 rounded-xl shadow-md border">
        <h3 className="text-lg font-semibold mb-4">Monthly Budget Summary</h3>
        <BudgetSummaryTable monthlyData={monthlyData} />
      </div>
    </div>
    </main>
    <footer className="bg-white text-center text-gray-500 p-4 text-sm shadow-inner">
    &copy; {new Date().getFullYear()} Ellora commercial . Created by Riya
  </footer>
</div>
  );
  
}
