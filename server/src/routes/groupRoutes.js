import { Router } from "express";
import * as groupController from "../controllers/groupController.js";
import * as expenseController from "../controllers/expenseController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createGroupSchema,
  groupIdParams,
  updateGroupSchema,
  updateMembersSchema
} from "../validators/groupValidators.js";
import { createExpenseSchema, listExpensesSchema } from "../validators/expenseValidators.js";

export const groupRouter = Router();

groupRouter.use(protect);

groupRouter.get("/", groupController.listGroups);
groupRouter.post("/", validate(createGroupSchema), groupController.createGroup);
groupRouter.get("/:id", validate(groupIdParams), groupController.getGroup);
groupRouter.patch("/:id", validate(updateGroupSchema), groupController.updateGroup);
groupRouter.delete("/:id", validate(groupIdParams), groupController.deleteGroup);
groupRouter.patch("/:id/members", validate(updateMembersSchema), groupController.updateMembers);
groupRouter.get("/:id/balances", validate(groupIdParams), groupController.getBalances);
groupRouter.get("/:id/expenses", validate(listExpensesSchema), expenseController.listExpenses);
groupRouter.post("/:id/expenses", validate(createExpenseSchema), expenseController.createExpense);
