import { Expense } from "../models/Expense.js";
import { Group } from "../models/Group.js";
import { calculateBalancesForGroup } from "../services/balanceService.js";
import * as groupService from "../services/groupService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/responses.js";

export const listGroups = asyncHandler(async (req, res) => {
  const groups = await groupService.populateGroup(
    Group.find({ members: req.user._id }).sort({ updatedAt: -1 })
  );

  const data = await Promise.all(
    groups.map(async (group) => {
      const unsettled = await Expense.aggregate([
        { $match: { group: group._id, isSettled: false } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
      ]);
      return {
        ...group.toObject(),
        stats: {
          unsettledTotal: Number((unsettled[0]?.total || 0).toFixed(2)),
          unsettledExpenseCount: unsettled[0]?.count || 0
        }
      };
    })
  );

  sendSuccess(res, data, "Groups fetched successfully");
});

export const getGroup = asyncHandler(async (req, res) => {
  await groupService.getGroupForMember(req.params.id, req.user._id);
  const group = await groupService.populateGroup(Group.findById(req.params.id));
  sendSuccess(res, group, "Group fetched successfully");
});

export const createGroup = asyncHandler(async (req, res) => {
  const group = await groupService.createGroup(req.validated.body, req.user._id);
  sendSuccess(res, group, "Group created successfully", 201);
});

export const updateGroup = asyncHandler(async (req, res) => {
  const group = await groupService.updateGroup(req.params.id, req.validated.body, req.user._id);
  sendSuccess(res, group, "Group updated successfully");
});

export const deleteGroup = asyncHandler(async (req, res) => {
  await groupService.deleteGroup(req.params.id, req.user._id);
  sendSuccess(res, null, "Group deleted successfully");
});

export const updateMembers = asyncHandler(async (req, res) => {
  const group = await groupService.updateMembers(req.params.id, req.validated.body, req.user._id);
  sendSuccess(res, group, "Group members updated successfully");
});

export const getBalances = asyncHandler(async (req, res) => {
  const balances = await calculateBalancesForGroup(req.params.id, req.user._id);
  sendSuccess(res, balances, "Balances fetched successfully");
});
