import { Expense } from "../models/Expense.js";
import { Group } from "../models/Group.js";
import { getGroupForMember, populateGroup } from "./groupService.js";
import { fromCents, toCents } from "../utils/money.js";

const userShape = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  avatarInitials: user.avatarInitials,
  avatarColor: user.avatarColor
});

export const calculateBalancesForGroup = async (groupId, requesterId = null) => {
  const group = requesterId
    ? await getGroupForMember(groupId, requesterId)
    : await populateGroup(Group.findById(groupId));

  await group.populate("members", "name email avatarInitials avatarColor");

  const expenses = await Expense.find({ group: groupId, isSettled: false })
    .populate("paidBy", "name email avatarInitials avatarColor")
    .populate("participants", "name email avatarInitials avatarColor")
    .populate("splits.user", "name email avatarInitials avatarColor")
    .sort({ createdAt: -1 });

  const members = group.members.map(userShape);
  const ledger = new Map(
    members.map((member) => [
      member.id,
      {
        user: member,
        paidCents: 0,
        owedCents: 0,
        netCents: 0
      }
    ])
  );

  for (const expense of expenses) {
    const payerId = String(expense.paidBy._id || expense.paidBy);
    if (ledger.has(payerId)) {
      ledger.get(payerId).paidCents += toCents(expense.amount);
    }

    for (const split of expense.splits) {
      const userId = String(split.user._id || split.user);
      if (ledger.has(userId)) {
        ledger.get(userId).owedCents += toCents(split.amount);
      }
    }
  }

  const summary = [...ledger.values()].map((entry) => {
    const netCents = entry.paidCents - entry.owedCents;
    entry.netCents = netCents;
    return {
      user: entry.user,
      paid: fromCents(entry.paidCents),
      owesShare: fromCents(entry.owedCents),
      net: fromCents(netCents)
    };
  });

  const debtors = [...ledger.values()]
    .filter((entry) => entry.netCents < 0)
    .map((entry) => ({ ...entry, balance: -entry.netCents }))
    .sort((a, b) => b.balance - a.balance);

  const creditors = [...ledger.values()]
    .filter((entry) => entry.netCents > 0)
    .map((entry) => ({ ...entry, balance: entry.netCents }))
    .sort((a, b) => b.balance - a.balance);

  const settlements = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const cents = Math.min(debtor.balance, creditor.balance);

    if (cents > 0) {
      settlements.push({
        from: debtor.user,
        to: creditor.user,
        amount: fromCents(cents),
        label: `${debtor.user.name} owes ${creditor.user.name} $${fromCents(cents).toFixed(2)}`
      });
    }

    debtor.balance -= cents;
    creditor.balance -= cents;
    if (debtor.balance === 0) debtorIndex += 1;
    if (creditor.balance === 0) creditorIndex += 1;
  }

  return {
    groupId: String(groupId),
    members,
    summary,
    settlements,
    unsettledExpenseCount: expenses.length,
    unsettledTotal: fromCents(expenses.reduce((sum, expense) => sum + toCents(expense.amount), 0))
  };
};
