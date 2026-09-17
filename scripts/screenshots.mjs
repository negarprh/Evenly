import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Render the real UI with isolated, deterministic API fixtures. No database writes.
const baseURL = process.env.SCREENSHOT_URL || 'http://127.0.0.1:5174';
const output = fileURLToPath(new URL('../docs/screenshots/', import.meta.url));
await mkdir(output, { recursive: true });
const users = [
  { _id: 'sarah', name: 'Sarah Chen', email: 'sarah@example.com', avatarInitials: 'SC', avatarColor: '#2563eb' },
  { _id: 'ali', name: 'Ali Khan', email: 'ali@example.com', avatarInitials: 'AK', avatarColor: '#0f766e' },
  { _id: 'priya', name: 'Priya Shah', email: 'priya@example.com', avatarInitials: 'PS', avatarColor: '#be123c' }
];
const date = '2026-09-17T12:00:00Z';
const expense = (id, title, amount, payer, splitType = 'equal', isSettled = false) => ({
  _id: id, group: 'apartment', title, amount, paidBy: users[payer], participants: users,
  splitType, isSettled, createdAt: date, notes: '',
  splits: users.map((user, i) => ({ user, amount: splitType === 'custom' ? [10, 7.5, 10][i] : amount / 3 }))
});
const expenses = [expense('groceries', 'Groceries', 84, 0), expense('internet', 'Internet bill', 60, 1), expense('supplies', 'Cleaning supplies', 27.5, 2, 'custom'), expense('dinner', 'Friday dinner', 90, 1, 'equal', true)];
const groups = [
  { _id: 'apartment', name: 'Apartment 4B', description: 'Groceries, bills, and household supplies.', stats: { unsettledExpenseCount: 3, unsettledTotal: 171.5 } },
  { _id: 'trip', name: 'Montreal weekend', description: 'Accommodation, transport, and meals.', stats: { unsettledExpenseCount: 2, unsettledTotal: 366 } },
  { _id: 'team', name: 'Studio', description: 'Team lunches and office supplies.', stats: { unsettledExpenseCount: 1, unsettledTotal: 72 } }
].map((group, i) => ({ ...group, members: users, createdAt: date, activities: [{ _id: `activity-${i}`, message: ['Ali added Internet bill', 'Sarah added Accommodation', 'Priya added Office supplies'][i], createdAt: date }] }));
const balance = id => {
  const totals = id === 'apartment' ? [[84, 58], [60, 55.5], [27.5, 58]] : id === 'trip' ? [[240, 122], [126, 122], [0, 122]] : [[0, 24], [0, 24], [72, 24]];
  const summary = users.map((u, i) => ({ user: { ...u, id: u._id }, paid: totals[i][0], owesShare: totals[i][1], net: totals[i][0] - totals[i][1] }));
  const settlements = id === 'apartment' ? [{ from: summary[2].user, to: summary[0].user, amount: 26 }, { from: summary[2].user, to: summary[1].user, amount: 4.5 }] : [];
  return { groupId: id, summary, settlements, unsettledExpenseCount: groups.find(g => g._id === id).stats.unsettledExpenseCount, unsettledTotal: groups.find(g => g._id === id).stats.unsettledTotal };
};
const browser = await chromium.launch({ ...(process.env.SCREENSHOT_CHANNEL ? { channel: process.env.SCREENSHOT_CHANNEL } : {}), headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1040 }, deviceScaleFactor: 1 });
  await context.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (!path.startsWith('/api/')) return route.continue();
    let data;
    if (path === '/api/auth/me') data = { user: users[0] };
    else if (path === '/api/groups') data = groups;
    else if (/\/balances$/.test(path)) data = balance(path.split('/')[3]);
    else if (/\/groups\/[^/]+\/expenses$/.test(path)) data = expenses;
    else if (path.startsWith('/api/expenses/')) data = expenses.find(e => e._id === path.split('/').pop());
    else if (path.startsWith('/api/groups/')) data = groups.find(g => g._id === path.split('/').pop());
    if (!data) throw new Error(`Missing screenshot fixture: ${path}`);
    await route.fulfill({ json: { success: true, data } });
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.clock.install({ time: new Date('2026-09-17T15:00:00Z') });
  async function visit(path) {
    await page.goto(`${baseURL}${path}`);
    await page.locator('h1, h2').first().waitFor();
    await page.locator('.shimmer').first().waitFor({ state: 'hidden' });
    await page.evaluate(() => document.fonts.ready);
  }
  async function capture(name, locator) {
    if (locator) await locator.screenshot({ path: `${output}/${name}.png`, style: "header { visibility: hidden; }" });
    else await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
    console.log(`Captured ${name}`);
  }
  await visit('/login'); await capture('sign-in');
  await page.setViewportSize({ width: 390, height: 844 });
  await visit('/login'); await capture('mobile-sign-in');
  await visit('/signup'); await capture('mobile-sign-up');
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Auth mobile overflow');
  await page.setViewportSize({ width: 1440, height: 1040 });
  await visit('/signup'); await capture('sign-up');
  await page.evaluate(() => localStorage.setItem('evenly_token', 'screenshot-fixture'));
  await visit('/dashboard'); await capture('dashboard');
  await visit('/groups'); await capture('groups');
  await visit('/groups/new'); await capture('create-group');
  await visit('/groups/apartment');
  await capture('balances', page.locator('main > div > div').first());
  await capture('members', page.locator('main > div > div').nth(1));
  await capture('expenses', page.locator('section').filter({ has: page.getByRole('heading', { name: 'Expenses', exact: true }) }));
  await capture('activity', page.locator('section').filter({ has: page.getByRole('heading', { name: 'Activity', exact: true }) }));
  await page.getByRole('button', { name: 'Mark settled', exact: true }).first().click();
  await page.screenshot({ path: `${output}/settlement.png` });
  await visit('/expenses/groceries/edit'); await capture('equal-split');
  await visit('/expenses/supplies/edit'); await capture('custom-split');
  await visit('/profile'); await capture('profile');
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/dashboard', '/groups', '/groups/apartment', '/expenses/supplies/edit', '/profile', '/groups/new']) {
    await visit(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error(`Horizontal overflow: ${path}`);
  }
  await visit('/dashboard'); await capture('mobile-dashboard');
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/dashboard', '/groups', '/groups/apartment', '/expenses/supplies/edit', '/profile', '/groups/new']) {
      await visit(path);
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Overflow at ${width}: ${path}`);
    }
  }
  await page.evaluate(() => localStorage.removeItem('evenly_token'));
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/login', '/signup']) {
      await visit(path);
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Auth overflow at ${width}: ${path}`);
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('All screens rendered without runtime errors or mobile overflow.');
} finally {
  await browser.close();
}
