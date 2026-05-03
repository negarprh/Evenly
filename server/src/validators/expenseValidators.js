import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const money = z.coerce.number().positive("Amount must be greater than 0").max(1000000, "Amount is too large");

const splitSchema = z.object({
  user: objectId,
  amount: money
});

export const listExpensesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: objectId }),
  query: z.object({}).optional()
});

export const expenseIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: objectId }),
  query: z.object({}).optional()
});

export const createExpenseSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2, "Expense title is required").max(120, "Expense title must be 120 characters or less"),
    amount: money,
    paidBy: objectId,
    splitType: z.enum(["equal", "custom"]),
    participants: z.array(objectId).min(1, "At least one participant is required"),
    splits: z.array(splitSchema).optional().default([]),
    notes: z.string().trim().max(500).optional().default("")
  }),
  params: z.object({ id: objectId }),
  query: z.object({}).optional()
});

export const updateExpenseSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(120).optional(),
    amount: money.optional(),
    paidBy: objectId.optional(),
    splitType: z.enum(["equal", "custom"]).optional(),
    participants: z.array(objectId).min(1).optional(),
    splits: z.array(splitSchema).optional(),
    notes: z.string().trim().max(500).optional()
  }),
  params: z.object({ id: objectId }),
  query: z.object({}).optional()
});
