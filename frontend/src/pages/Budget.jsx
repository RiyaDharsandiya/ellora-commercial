import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BudgetCard from '../components/BudgetCard';
import MiscExpSection from '../components/MiscExpenses';
const API_URL = import.meta.env.VITE_API_URL;

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetName, setBudgetName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  const fetchBudgets = async () => {
    const token = sessionStorage.getItem('token');
    const res = await axios.get(`${API_URL}/api/budgets/getBudget`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    setBudgets(res.data);
  };
  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleCreateBudget = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/budgets/createBudget`,
        {
          name: budgetName,
          amount: 0,
          spent: 0,
          propertyDetails: "",
          stamp: 0,
          registrationFee: 0,
          officeMiscExpense: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setBudgets([...budgets, res.data]);
      setBudgetName('');
      setIsModalOpen(false);
      const newBudgetId = res.data._id;
      navigate(`/budgetDetails/${newBudgetId}`);
    } catch (error) {
      console.log(error.response?.data?.error || error.message);
    }
  };

  // Filter budgets by name
  const filteredBudgets = budgets.filter(budget =>
    budget.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
      <h1 className="text-2xl md:text-3xl font-bold">My Parties</h1>
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <div className="flex items-center bg-gray-50 border border-gray-300 rounded-full px-4 py-2 w-full md:w-64 shadow-sm focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-200 transition">
          <svg
            className="w-5 h-5 text-gray-400 mr-2 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
          />
        </div>
        <button
          onClick={() => navigate('/all-budgets')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition w-full sm:w-auto"
        >
          View All Budgets
        </button>
      </div>
    </div>


      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create New Budget Card */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-gray-300 flex justify-center items-center h-40 cursor-pointer hover:border-indigo-500 transition"
        >
          <div className="text-center">
            <div className="text-2xl">+</div>
            <p className="font-semibold">Create New Party</p>
          </div>
        </div>

        {/* Budget Cards */}
        {filteredBudgets.map((budget, idx) => (
          <BudgetCard
            key={budget._id || idx}
            budget={budget}
            onViewDetails={() => navigate(`/budgetDetails/${budget._id}`)}
            showViewDetails={true}
            showActions={false}
          />
        ))}
      </div>

      {filteredBudgets.length === 0 && (
        <div className="col-span-3 text-center text-gray-500">
          {searchQuery ? 'No matching budgets found.' : 'No budgets found. Create your first budget!'}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Party</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 text-xl">&times;</button>
            </div>

            <label className="block font-medium mb-1">Party Name:</label>
            <input
              type="text"
              className="w-full border rounded p-2 mb-4"
              value={budgetName}
              onChange={(e) => setBudgetName(e.target.value)}
              placeholder="Enter party name"
            />

            <button
              onClick={handleCreateBudget}
              className="bg-black text-white py-2 px-4 rounded w-full"
            >
              Create Party
            </button>
          </div>
        </div>
      )}
      <MiscExpSection />
    </div>
    </main>
    <footer className="bg-white text-center text-gray-500 p-4 text-sm shadow-inner">
        &copy; {new Date().getFullYear()} Ellora commercial . Created by Riya
      </footer>
    </div>
  );
};

export default Budget;
