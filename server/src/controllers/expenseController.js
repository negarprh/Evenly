import { Expense } from "../models/Expense.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/responses.js";
import { addActivity, getGroupForMember } from "../services/groupService.js";
import { assertMembers, buildSplits, normalizeIds } from "../services/splitService.js";
import { calculateBalancesForGroup } from "../services/balanceService.js";
import { emitExpenseChanged } from "../sockets/socket.js";

const populateExpense = (query) =>
  query
    .populate("paidBy", "name email avatarInitials avatarColor")
    .populate("participants", "name email avatarInitials avatarColor")
    .populate("splits.user", "name email avatarInitials avatarColor")
    .populate("createdBy", "name email avatarInitials avatarColor");

const emitUpdates = async (groupId, action, expense) => {
  const balances = await calculateBalancesForGroup(groupId);
  emitExpenseChanged(groupId, action, expense, balances);
};

const canUserSettleExpense = (expense, userId) => {
  const payerId = String(expense.paidBy);
  const requesterId = String(userId);
  if (payerId === requesterId) return false;

  return expense.splits.some((split) => String(split.user) === requesterId && Number(split.amount) > 0);
};

export const listExpenses = asyncHandler(async (req, res) => {
  await getGroupForMember(req.params.id, req.user._id);
  const expenses = await populateExpense(
    Expense.find({ group: req.params.id }).sort({ createdAt: -1 })
  );
  sendSuccess(res, expenses, "Expenses fetched successfully");
});

export const getExpense = asyncHandler(async (req, res) => {
  const expense = await populateExpense(Expense.findById(req.params.id));
  if (!expense) throw new ApiError(404, "Expense not found", "EXPENSE_NOT_FOUND");
  await getGroupForMember(expense.group, req.user._id);
  sendSuccess(res, expense, "Expense fetched successfully");
});

export const createExpense = asyncHandler(async (req, res) => {
  const group = await getGroupForMember(req.params.id, req.user._id);
  const body = req.validated.body;
  const participantIds = normalizeIds(body.participants);

  assertMembers(group, [body.paidBy], "payers");
  assertMembers(group, participantIds);

  const splits = buildSplits({
    amount: body.amount,
    splitType: body.splitType,
    participants: participantIds,
    splits: body.splits
  });

  const expense = await Expense.create({
    group: group._id,
    title: body.title,
    amount: Number(Number(body.amount).toFixed(2)),
    paidBy: body.paidBy,
    splitType: body.splitType,
    participants: participantIds,
    splits,
    notes: body.notes || "",
    createdBy: req.user._id
  });

  await addActivity(group._id, {
    action: "expense_created",
    message: `${req.user.name} added ${expense.title}`,
    actor: req.user._id,
    expenseTitle: expense.title,
    amount: expense.amount
  });

  const populated = await populateExpense(Expense.findById(expense._id));
  await emitUpdates(group._id, "created", populated);
  sendSuccess(res, populated, "Expense created successfully", 201);
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) throw new ApiError(404, "Expense not found", "EXPENSE_NOT_FOUND");
  const group = await getGroupForMember(expense.group, req.user._id);
  const body = req.validated.body;

  const nextAmount = body.amount ?? expense.amount;
  const nextSplitType = body.splitType ?? expense.splitType;
  const nextParticipants = normalizeIds(body.participants ?? expense.participants);
  const nextPaidBy = body.paidBy ?? expense.paidBy;

  assertMembers(group, [nextPaidBy], "payers");
  assertMembers(group, nextParticipants);

  const splits = buildSplits({
    amount: nextAmount,
    splitType: nextSplitType,
    participants: nextParticipants,
    splits: body.splits ?? expense.splits
  });

  expense.title = body.title ?? expense.title;
  expense.amount = Number(Number(nextAmount).toFixed(2));
  expense.paidBy = nextPaidBy;
  expense.splitType = nextSplitType;
  expense.participants = nextParticipants;
  expense.splits = splits;
  expense.notes = body.notes ?? expense.notes;
  await expense.save();

  await addActivity(group._id, {
    action: "expense_updated",
    message: `${req.user.name} updated ${expense.title}`,
    actor: req.user._id,
    expenseTitle: expense.title,
    amount: expense.amount
  });

  const populated = await populateExpense(Expense.findById(expense._id));
  await emitUpdates(group._id, "updated", populated);
  sendSuccess(res, populated, "Expense updated successfully");
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) throw new ApiError(404, "Expense not found", "EXPENSE_NOT_FOUND");
  const group = await getGroupForMember(expense.group, req.user._id);

  await addActivity(group._id, {
    action: "expense_deleted",
    message: `${req.user.name} deleted ${expense.title}`,
    actor: req.user._id,
    expenseTitle: expense.title,
    amount: expense.amount
  });
  await expense.deleteOne();

  await emitUpdates(group._id, "deleted", { _id: req.params.id, group: group._id });
  sendSuccess(res, null, "Expense deleted successfully");
});

export const settleExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) throw new ApiError(404, "Expense not found", "EXPENSE_NOT_FOUND");
  const group = await getGroupForMember(expense.group, req.user._id);
  if (!canUserSettleExpense(expense, req.user._id)) {
    throw new ApiError(403, "Only a user who owes on this expense can mark it settled", "EXPENSE_SETTLE_FORBIDDEN");
  }

  expense.isSettled = true;
  expense.settledAt = new Date();
  await expense.save();

  await addActivity(group._id, {
    action: "expense_settled",
    message: `${req.user.name} marked ${expense.title} settled`,
    actor: req.user._id,
    expenseTitle: expense.title,
    amount: expense.amount
  });

  const populated = await populateExpense(Expense.findById(expense._id));
  await emitUpdates(group._id, "settled", populated);
  sendSuccess(res, populated, "Expense settled successfully");
});
