export const toCents = (value) => Math.round(Number(value) * 100);

export const fromCents = (cents) => Number((cents / 100).toFixed(2));

export const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;
