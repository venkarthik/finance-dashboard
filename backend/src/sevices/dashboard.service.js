import prisma from "../utils/prisma.js";

export const getSummary = async () => {
  const records = await prisma.financialRecord.findMany({
    where: { isDeleted: false },
    select: { amount: true, type: true, category: true, date: true },
  });

  const totalIncome = records
    .filter((r) => r.type === "INCOME")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpenses = records
    .filter((r) => r.type === "EXPENSE")
    .reduce((sum, r) => sum + r.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  return {
    totalIncome: parseFloat(totalIncome.toFixed(2)),
    totalExpenses: parseFloat(totalExpenses.toFixed(2)),
    netBalance: parseFloat(netBalance.toFixed(2)),
    totalRecords: records.length,
  };
};

export const getCategoryTotals = async () => {
  const records = await prisma.financialRecord.findMany({
    where: { isDeleted: false },
    select: { amount: true, type: true, category: true },
  });

  const categoryMap = {};

  for (const record of records) {
    if (!categoryMap[record.category]) {
      categoryMap[record.category] = { income: 0, expense: 0 };
    }
    if (record.type === "INCOME") {
      categoryMap[record.category].income += record.amount;
    } else {
      categoryMap[record.category].expense += record.amount;
    }
  }

  return Object.entries(categoryMap).map(([category, totals]) => ({
    category,
    income: parseFloat(totals.income.toFixed(2)),
    expense: parseFloat(totals.expense.toFixed(2)),
    net: parseFloat((totals.income - totals.expense).toFixed(2)),
  }));
};

export const getMonthlyTrends = async () => {
  const records = await prisma.financialRecord.findMany({
    where: { isDeleted: false },
    select: { amount: true, type: true, date: true },
    orderBy: { date: "asc" },
  });

  const monthMap = {};

  for (const record of records) {
    const key = record.date.toISOString().slice(0, 7); // YYYY-MM
    if (!monthMap[key]) {
      monthMap[key] = { month: key, income: 0, expense: 0 };
    }
    if (record.type === "INCOME") {
      monthMap[key].income += record.amount;
    } else {
      monthMap[key].expense += record.amount;
    }
  }

  return Object.values(monthMap).map((m) => ({
    ...m,
    income: parseFloat(m.income.toFixed(2)),
    expense: parseFloat(m.expense.toFixed(2)),
    net: parseFloat((m.income - m.expense).toFixed(2)),
  }));
};

export const getRecentActivity = async (limit = 10) => {
  return prisma.financialRecord.findMany({
    where: { isDeleted: false },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true } },
    },
  });
};

export const getWeeklyTrends = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const records = await prisma.financialRecord.findMany({
    where: {
      isDeleted: false,
      date: { gte: sevenDaysAgo },
    },
    select: { amount: true, type: true, date: true },
    orderBy: { date: "asc" },
  });

  const dayMap = {};

  for (const record of records) {
    const key = record.date.toISOString().slice(0, 10); // YYYY-MM-DD
    if (!dayMap[key]) {
      dayMap[key] = { date: key, income: 0, expense: 0 };
    }
    if (record.type === "INCOME") {
      dayMap[key].income += record.amount;
    } else {
      dayMap[key].expense += record.amount;
    }
  }

  return Object.values(dayMap).map((d) => ({
    ...d,
    income: parseFloat(d.income.toFixed(2)),
    expense: parseFloat(d.expense.toFixed(2)),
  }));
};