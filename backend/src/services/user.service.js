import bcrypt from "bcryptjs";
import prisma from "../utils/prisma.js";

export const getAllUsers = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

export const updateUser = async (id, data) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, status: true, updatedAt: true },
  });
};

export const deleteUser = async (id, requestingUserId) => {
  if (id === requestingUserId) {
    const error = new Error("You cannot delete your own account.");
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  await prisma.user.delete({ where: { id } });
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const error = new Error("Current password is incorrect.");
    error.statusCode = 400;
    throw error;
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
};