import bcrypt from "bcrypt";
import { connectDB } from "../config/db.js";
import { ensureEnv } from "../config/env.js";
import { Expense } from "../models/Expense.js";
import { Group } from "../models/Group.js";
import { User } from "../models/User.js";
import { buildSplits } from "../services/splitService.js";

ensureEnv();
await connectDB();

const passwordHash = await bcrypt.hash("password123", 12);

await Promise.all([Expense.deleteMany({}), Group.deleteMany({}), User.deleteMany({})]);

const users = await User.create([
  {
    name: "Sarah Chen",
    email: "sarah@evenly.dev",
    passwordHash,
    avatarInitials: "SC",
    avatarColor: "#2563eb"
  },
  {
    name: "Ali Khan",
    email: "ali@evenly.dev",
    passwordHash,
    avatarInitials: "AK",
    avatarColor: "#0f766e"
  },
  {
    name: "Priya Shah",
    email: "priya@evenly.dev",
    passwordHash,
    avatarInitials: "PS",
    avatarColor: "#be123c"
  }
]);

const [sarah, ali, priya] = users;

const apartment = await Group.create({
  name: "Apartment 4B",
  description: "Shared household costs for groceries, bills, and the little things that always pop up.",
  createdBy: sarah._id,
  members: users.map((user) => user._id),
  activities: [
    {
      action: "expense_created",
      message: "Sarah added Groceries for $84.00",
      actor: sarah._id,
      expenseTitle: "Groceries",
      amount: 84
    },
    {
      action: "expense_created",
      message: "Ali added Internet Bill for $60.00",
      actor: ali._id,
      expenseTitle: "Internet Bill",
      amount: 60
    },
    {
      action: "expense_created",
      message: "Priya added Cleaning Supplies for $27.50",
      actor: priya._id,
      expenseTitle: "Cleaning Supplies",
      amount: 27.5
    }
  ]
});

const montreal = await Group.create({
  name: "Montreal Weekend Trip",
  description: "Travel costs for the Airbnb, airport rides, and dinners around the city.",
  createdBy: ali._id,
  members: users.map((user) => user._id),
  activities: [
    {
      action: "expense_created",
      message: "Sarah added Airbnb Deposit for $240.00",
      actor: sarah._id,
      expenseTitle: "Airbnb Deposit",
      amount: 240
    },
    {
      action: "expense_created",
      message: "Ali added Dinner Night 1 for $126.00",
      actor: ali._id,
      expenseTitle: "Dinner Night 1",
      amount: 126
    },
    {
      action: "expense_settled",
      message: "Priya marked Uber to Airport as settled",
      actor: priya._id,
      expenseTitle: "Uber to Airport",
      amount: 42
    }
  ]
});

const startupHouse = await Group.create({
  name: "Startup House",
  description: "Shared supplies and snacks for the team living and working together.",
  createdBy: priya._id,
  members: users.map((user) => user._id),
  activities: [
    {
      action: "expense_created",
      message: "Priya added Shared Supplies for $72.00",
      actor: priya._id,
      expenseTitle: "Shared Supplies",
      amount: 72
    },
    {
      action: "expense_settled",
      message: "Sarah marked Snack Restock as settled",
      actor: sarah._id,
      expenseTitle: "Snack Restock",
      amount: 36
    }
  ]
});

const makeExpense = ({
  group,
  title,
  amount,
  paidBy,
  splitType,
  participants,
  splits = [],
  notes = "",
  isSettled = false,
  settledAt = null
}) => ({
  group: group._id,
  title,
  amount,
  paidBy: paidBy._id,
  splitType,
  participants: participants.map((user) => user._id),
  splits: buildSplits({
    amount,
    splitType,
    participants: participants.map((user) => user._id),
    splits: splits.map((split) => ({ user: split.user._id, amount: split.amount }))
  }),
  notes,
  isSettled,
  settledAt,
  createdBy: paidBy._id
});

await Expense.create([
  makeExpense({
    group: apartment,
    title: "Groceries",
    amount: 84,
    paidBy: sarah,
    splitType: "equal",
    participants: users,
    notes: "Weekly grocery run"
  }),
  makeExpense({
    group: apartment,
    title: "Internet Bill",
    amount: 60,
    paidBy: ali,
    splitType: "equal",
    participants: users,
    notes: "Monthly internet"
  }),
  makeExpense({
    group: apartment,
    title: "Cleaning Supplies",
    amount: 27.5,
    paidBy: priya,
    splitType: "custom",
    participants: users,
    splits: [
      { user: sarah, amount: 10 },
      { user: ali, amount: 7.5 },
      { user: priya, amount: 10 }
    ]
  }),
  makeExpense({
    group: montreal,
    title: "Airbnb Deposit",
    amount: 240,
    paidBy: sarah,
    splitType: "custom",
    participants: users,
    splits: [
      { user: sarah, amount: 80 },
      { user: ali, amount: 80 },
      { user: priya, amount: 80 }
    ]
  }),
  makeExpense({
    group: montreal,
    title: "Dinner Night 1",
    amount: 126,
    paidBy: ali,
    splitType: "equal",
    participants: users,
    notes: "First night out in Old Montreal"
  }),
  makeExpense({
    group: montreal,
    title: "Uber to Airport",
    amount: 42,
    paidBy: priya,
    splitType: "equal",
    participants: users,
    isSettled: true,
    settledAt: new Date()
  }),
  makeExpense({
    group: startupHouse,
    title: "Shared Supplies",
    amount: 72,
    paidBy: priya,
    splitType: "equal",
    participants: users,
    notes: "Whiteboard markers, cables, and printer paper"
  }),
  makeExpense({
    group: startupHouse,
    title: "Snack Restock",
    amount: 36,
    paidBy: sarah,
    splitType: "custom",
    participants: users,
    splits: [
      { user: sarah, amount: 12 },
      { user: ali, amount: 12 },
      { user: priya, amount: 12 }
    ],
    isSettled: true,
    settledAt: new Date()
  })
]);

console.log("Seed complete");
console.log("Demo password for all users: password123");
await Expense.db.close();
