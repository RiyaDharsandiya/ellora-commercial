import express from 'express';
import { createMiscExpBudget ,getMiscExpBudgets,getMiscExpById,addMiscExpEntry,getMonthlyMiscExp, deleteEntry, deleteMiscExp} from '../controllers/miscExpController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.put('/:id/addEntry', addMiscExpEntry);
router.post('/create',authenticate, createMiscExpBudget);
router.get("/getMiscExpense",authenticate, getMiscExpBudgets);
router.get('/monthly',authenticate, getMonthlyMiscExp);
router.get('/:id', getMiscExpById);
router.delete('/delete-entry', authenticate, deleteEntry);
router.delete("/delete/:id", authenticate, deleteMiscExp);
export default router;
