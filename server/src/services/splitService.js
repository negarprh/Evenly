import { ApiError } from "../utils/ApiError.js";
import { fromCents, toCents } from "../utils/money.js";

export const normalizeIds = (ids) => [...new Set(ids.map((id) => String(id)))];

export const assertMembers = (group, ids, label = "participants") => {
  const memberIds = group.members.map((member) => String(member._id || member));
  const outside = ids.filter((id) => !memberIds.includes(String(id)));
  if (outside.length > 0) {
    throw new ApiError(400, `All ${label} must belong to the group`, "NON_MEMBER_IN_EXPENSE");
  }
};

export const buildSplits = ({ amount, splitType, participants, splits = [] }) => {
  const participantIds = normalizeIds(participants);
  if (participantIds.length === 0) {
    throw new ApiError(400, "At least one participant is required", "NO_PARTICIPANTS");
  }

  const totalCents = toCents(amount);
  if (totalCents <= 0) {
    throw new ApiError(400, "Amount must be greater than 0", "INVALID_AMOUNT");
  }

  if (splitType === "equal") {
    const base = Math.floor(totalCents / participantIds.length);
    const remainder = totalCents % participantIds.length;
    return participantIds.map((user, index) => ({
      user,
      amount: fromCents(base + (index < remainder ? 1 : 0))
    }));
  }

  const splitByUser = new Map(splits.map((split) => [String(split.user), toCents(split.amount)]));
  const missing = participantIds.filter((id) => !splitByUser.has(id));
  if (missing.length > 0 || splitByUser.size !== participantIds.length) {
    throw new ApiError(400, "Custom splits must include exactly one amount for each participant", "INVALID_SPLIT_PARTICIPANTS");
  }

  const splitTotal = [...splitByUser.values()].reduce((sum, cents) => sum + cents, 0);
  if (splitTotal !== totalCents) {
    throw new ApiError(400, "Custom split total must equal expense amount", "INVALID_SPLIT");
  }

  return participantIds.map((user) => ({
    user,
    amount: fromCents(splitByUser.get(user))
  }));
};
