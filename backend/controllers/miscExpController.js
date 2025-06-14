import mongoose from 'mongoose';
import MiscExp from '../models/MiscExpense.js';

export const createMiscExpBudget = async (req, res) => {
  try {
    const { data, totalMiscExp } = req.body;
    const userId = req.user.id; // Or req.userId, depending on your middleware

    // Convert data object to an entry with date and data
    const newEntry = {
      date: new Date(),
      data: data || {}
    };

    const newMiscExp = new MiscExp({
      user: userId,
      entries: [newEntry], // Store as an array of entries
      totalMiscExp: totalMiscExp || 0
    });

    await newMiscExp.save();

    res.status(201).json({
      success: true,
      message: "MiscExp budget created successfully",
      miscExp: newMiscExp,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create MiscExp budget",
    });
  }
};

  


export const getMiscExpBudgets = async (req, res) => {
    try {
      const userId = req.user.id;
      const miscExpBudgets = await MiscExp.find({ user: userId }).sort({ date: -1 });
      return res.json(miscExpBudgets);
    } catch (err) {
        console.log(err.message);
      res.status(500).json({ error: err.message });
    }
  };
  

export const getMiscExpById = async (req, res) => {
    try {
      const miscExp = await MiscExp.findById(req.params.id);
      if (!miscExp) {
        return res.status(404).json({ error: "MiscExp not found" });
      }
      res.json(miscExp);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  export const addMiscExpEntry = async (req, res) => {
    try {
      const { id } = req.params;
      const { data } = req.body; // Expect data as an object of key-value pairs
  
      let miscExp = await MiscExp.findById(id);
      if (!miscExp) {
        return res.status(404).json({ error: "MiscExp not found" });
      }
  
      // Convert all values in data to numbers
      const numericData = {};
      for (let key in data) {
        const num = Number(data[key]);
        numericData[key] = isNaN(num) ? 0 : num; // Default to 0 if not a number
      }
  
      // Push a new entry with current date and numeric data
      miscExp.entries.push({
        date: req.body.date || new Date(),
        data: numericData
      });
  
      // Sum all amounts in all entries
      let total = 0;
      miscExp.entries.forEach(entry => {
        for (let key in entry.data) {
          const num = Number(entry.data[key]); // Redundant but safe
          if (!isNaN(num)) total += num;
        }
      });
  
      // Update totalMiscExp
      miscExp.totalMiscExp = total;
  
      await miscExp.save();
  
      res.status(200).json({
        success: true,
        message: "MiscExp updated successfully",
        miscExp,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update MiscExp",
      });
    }
  };
  
  
  export const getMonthlyMiscExp = async (req, res) => {
    try {
      const userId = req.user.id;

      const monthlyData = await MiscExp.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $unwind: "$entries" },
        {
          $group: {
            _id: {
              year: { $year: "$entries.date" },
              month: { $month: "$entries.date" }
            },
            totalMiscExp: {
              $sum: {
                $sum: {
                  $map: {
                    input: { $objectToArray: "$entries.data" },
                    in: { $toDouble: "$$this.v" }
                  }
                }
              }
            }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);
  
      res.status(200).json(monthlyData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  export const deleteEntry = async (req, res) => {
    try {
      const { category } = req.body; // e.g., category: 's'
      const userId = req.user.id;
  
      let miscExp = await MiscExp.findOne({ user: userId });
      if (!miscExp) return res.status(404).json({ success: false, message: 'MiscExp not found' });
  
      // Filter out entries where 'category' exists in entry.data
      const originalCount = miscExp.entries.length;
      miscExp.entries = miscExp.entries.filter(entry => !(category in entry.data));
      const removedCount = originalCount - miscExp.entries.length;
  
      if (removedCount === 0) {
        return res.status(404).json({ success: false, message: 'No entry found with this category' });
      }
  
      // Recalculate totalMiscExp
      let total = 0;
      miscExp.entries.forEach(entry => {
        Object.values(entry.data).forEach(val => {
          if (typeof val === 'number') total += val;
          if (typeof val === 'string' && !isNaN(val)) total += Number(val);
        });
      });
      miscExp.totalMiscExp = total;
  
      await miscExp.save();
      res.json({ success: true, message: `${removedCount} entry(s) deleted` });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
  export const deleteMiscExp = async (req, res) => {
    try {
      const { id } = req.params;
      // Only delete if the MiscExp belongs to the logged-in user
      const deleted = await MiscExp.findOneAndDelete({
        _id: id,
        user: req.user.id,
      });
      if (!deleted) {
        return res.status(404).json({ message: "MiscExp not found or not authorized" });
      }
      res.json({ message: "MiscExp deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };