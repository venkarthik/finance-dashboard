import { verifyToken } from "../utils/jwt.js";
import { errorResponse } from "../utils/response.js";
import prisma from "../utils/prisma.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, "Access denied. No token provided.", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // Fetch fresh user from DB to catch status/role changes
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    if (!user) {
      return errorResponse(res, "User no longer exists.", 401);
    }

    if (user.status === "INACTIVE") {
      return errorResponse(res, "Your account has been deactivated.", 403);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return errorResponse(res, "Token has expired. Please log in again.", 401);
    }
    return errorResponse(res, "Invalid token.", 401);
  }
};