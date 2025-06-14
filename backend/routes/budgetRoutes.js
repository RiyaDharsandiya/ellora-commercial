import express from 'express';
import { getBudgets, createBudget ,getBudgetById,updateBudget,deleteBudget,addPropertyBudget,deletePropertyBudgetEntry,updatePropertyBudgetEntry, getMonthlyRemaining} from '../controllers/budgetController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.get('/getBudget',authenticate, getBudgets);
router.post('/createBudget', authenticate,createBudget);
router.get('/getBudget/:id', getBudgetById);
router.put("/updateBudget/:id", authenticate, updateBudget);
router.delete("/deleteBudget/:id", authenticate, deleteBudget);
router.post("/addPropertyBudget/:budgetId", authenticate, addPropertyBudget);
router.delete('/deletePropertyBudgetEntry/:budgetId/:entryId', authenticate, deletePropertyBudgetEntry);
router.put('/updatePropertyBudgetEntry/:budgetId/:entryId', authenticate, updatePropertyBudgetEntry);
router.get('/monthly-remaining', authenticate,getMonthlyRemaining);


export default router;
