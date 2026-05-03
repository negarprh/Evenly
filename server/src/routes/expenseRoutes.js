import { Router } from "express";
import * as expenseController from "../controllers/expenseController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { expenseIdSchema, updateExpenseSchema } from "../validators/expenseValidators.js";

export const expenseRouter = Router();

expenseRouter.use(protect);

expenseRouter.get("/:id", validate(expenseIdSchema), expenseController.getExpense);
expenseRouter.patch("/:id", validate(updateExpenseSchema), expenseController.updateExpense);
expenseRouter.delete("/:id", validate(expenseIdSchema), expenseController.deleteExpense);
expenseRouter.patch("/:id/settle", validate(expenseIdSchema), expenseController.settleExpense);
