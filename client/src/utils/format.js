import { format, formatDistanceToNow } from "date-fns";

export const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value || 0));

export const timeAgo = (date) => (date ? `${formatDistanceToNow(new Date(date))} ago` : "");

export const calendarDate = (date) => (date ? format(new Date(date), "MMM d, yyyy") : "");

export const userName = (user) => user?.name || user?.email || "Unknown";

export const formatBalanceCopy = (value) => {
  const numeric = Number(value || 0);
  if (numeric > 0) return `You're owed ${money(numeric)}`;
  if (numeric < 0) return `You owe ${money(Math.abs(numeric))}`;
  return "Settled up";
};

export const balanceTone = (value) => {
  const numeric = Number(value || 0);
  if (numeric > 0) return "positive";
  if (numeric < 0) return "negative";
  return "neutral";
};

export const sumBy = (items, getter) =>
  items.reduce((total, item) => total + Number(getter(item) || 0), 0);
