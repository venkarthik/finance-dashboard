import prisma from "../utils/prisma.js";

export const getRecords = async ({ page = 1, limit = 10, type, category, startDate, endDate, search }) => {
  const skip = (page - 1) * limit;

  const where = {
    isDeleted: false,
    ...(type && { type }),
    ...(category && { category: { contains: category } }),
    ...(search && {
      OR: [
        { category: { contains: search } },
        { notes: { contains: search } },
      ],
    }),
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        }
      : {}),
  };

  const [records, total] = await Promise.all([
    prisma.financialRecord.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.financialRecord.count({ where }),
  ]);

  return {
    records,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getRecordById = async (id) => {
  const record = await prisma.financialRecord.findFirst({
    where: { id, isDeleted: false },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!record) {
    const error = new Error("Record not found.");
    error.statusCode = 404;
    throw error;
  }

  return record;
};

export const createRecord = async (data, userId) => {
  return prisma.financialRecord.create({
    data: {
      ...data,
      date: new Date(data.date),
      userId,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
};

export const updateRecord = async (id, data) => {
  const record = await prisma.financialRecord.findFirst({
    where: { id, isDeleted: false },
  });

  if (!record) {
    const error = new Error("Record not found.");
    error.statusCode = 404;
    throw error;
  }

  return prisma.financialRecord.update({
    where: { id },
    data: {
      ...data,
      ...(data.date && { date: new Date(data.date) }),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
};

export const deleteRecord = async (id) => {
  const record = await prisma.financialRecord.findFirst({
    where: { id, isDeleted: false },
  });

  if (!record) {
    const error = new Error("Record not found.");
    error.statusCode = 404;
    throw error;
  }

  // Soft delete
  await prisma.financialRecord.update({
    where: { id },
    data: { isDeleted: true },
  });
};