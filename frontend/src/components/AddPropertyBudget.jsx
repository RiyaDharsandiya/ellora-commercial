import { useState } from 'react';
import axios from 'axios';
import { FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
const API_URL = import.meta.env.VITE_API_URL;

const AddPropertyBudget = ({ budgetId, onUpdated }) => {
  const [formData, setFormData] = useState({
    amount: "",
    propertyDetails: '',
    stamp: '',
    registrationFee: '',
    officeMiscExpense: '',
    date: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.propertyDetails || !formData.amount || !formData.date) {
      toast.error('Property details, amount, and date are required');
      return;
    }
    if (isNaN(Number(formData.amount))) {
      toast.error('Amount must be a number');
      return;
    }
    if (formData.stamp && isNaN(Number(formData.stamp))) {
      toast.error('Stamp must be a number');
      return;
    }
    if (formData.registrationFee && isNaN(Number(formData.registrationFee))) {
      toast.error('Registration fee must be a number');
      return;
    }
    if (formData.officeMiscExpense && isNaN(Number(formData.officeMiscExpense))) {
      toast.error('Office misc expense must be a number');
      return;
    }
    if (!formData.date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    

    try {
      const dateISO = new Date(formData.date).toISOString();
      const payload = {
        ...formData,
        date: dateISO,
      };

      const token = sessionStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/budgets/addPropertyBudget/${budgetId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdated(res.data);
      setFormData({
        propertyDetails: '',
        stamp: '',
        registrationFee: '',
        officeMiscExpense: '',
        amount: '',
        date: '',
      });
      toast.success('Entry added successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to add entry');
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-lg">
      <Toaster />
      <h2 className="text-xl font-bold mb-4">Add Party Details</h2>
      
      {[
        ['propertyDetails', 'Property Details'],
        ['amount', 'Deposited Amount'],
        ['stamp', 'Stamp Duty'],
        ['registrationFee', 'Registration Fee'],
        ['officeMiscExpense', 'Office Miscellaneous Expense'],
      ].map(([key, label]) => (
        <div className="mb-2" key={key}>
          <label className="block font-medium">{label}</label>
          <input
            name={key}
            value={formData[key]}
            onChange={handleChange}
            className="border px-2 py-1 w-full rounded"
            type="text"
          />
        </div>
      ))}
      <div className="mb-2">
        <label className="block font-medium">Date</label>
        <input
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          className="border px-2 py-1 w-full rounded"
          required
        />
      </div>
      <button
        onClick={handleSubmit}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition mt-3"
      >
        <FaPlus />
        <span>Add Entry</span>
      </button>
    </div>
  );
};

export default AddPropertyBudget;
