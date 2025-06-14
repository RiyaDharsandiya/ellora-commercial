import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

export default function MiscExpSection() {
  const [miscExpBudgets, setMiscExpBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch MiscExp budgets on component mount
  useEffect(() => {
    const fetchMiscExpBudgets = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/miscexp/getMiscExpense`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          }
        });
        setMiscExpBudgets(res.data);
      } catch (error) {
        console.error("Failed to fetch MiscExp budgets:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMiscExpBudgets();
  }, []);

  // Add a new Misc Expense card and sync with backend
  const handleCreateMiscExp = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/api/miscexp/create`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          }
        }
      );
      setMiscExpBudgets([...miscExpBudgets, res.data.miscExp]);
    } catch (error) {
      console.error("Failed to create MiscExp:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMiscExp = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/api/miscexp/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        }
      });
      setMiscExpBudgets(miscExpBudgets.filter(budget => budget._id !== id));
    } catch (error) {
      console.error("Failed to delete MiscExp:", error.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4">Misc Exp</h2>
      <div className="flex flex-wrap gap-6">
        {/* Create New Misc Exp Card */}
        <div
          onClick={handleCreateMiscExp}
          className="border-2 border-dashed rounded-lg p-8 min-w-[300px] flex flex-col items-center justify-center cursor-pointer"
        >
          <span className="text-3xl mb-2">+</span>
          <span>Create New Misc Exp</span>
        </div>
        {/* Render Misc Exp Cards */}
        {miscExpBudgets.length > 0 ? (
          miscExpBudgets.map((budget) => (
            <div
              key={budget?._id || budget?.id}
              className="border rounded-lg p-6 min-w-[300px] flex-1 max-w-xs relative"
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">💸</span>
                <span className="font-bold text-lg">
                  {budget?.title || "Misc Expense"}
                </span>
                <button
                  onClick={() => handleDeleteMiscExp(budget._id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
              <button
                onClick={() => navigate(`/miscExpDetails/${budget?._id || budget?.id}`)}
                className="text-blue-600 underline text-sm mt-2 inline-block"
              >
                View Details
              </button>
            </div>
          ))
        ) : (
          <div className="min-w-[300px] p-6 border rounded-lg">
            No budget found
          </div>
        )}
      </div>
    </div>
  );
}