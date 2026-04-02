import { errorResponse } from "../utils/response.js";

// Role hierarchy: ADMIN > ANALYST > VIEWER
const ROLE_LEVELS = {
  VIEWER: 1,
  ANALYST: 2,
  ADMIN: 3,
};

/**
 * Authorize based on minimum role level required
 * Usage: authorize("ADMIN") or authorize("ANALYST")
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, "Not authenticated.", 401);
    }

    const userRoleLevel = ROLE_LEVELS[req.user.role] || 0;
    const hasPermission = allowedRoles.some(
      (role) => userRoleLevel >= ROLE_LEVELS[role]
    );

    if (!hasPermission) {
      return errorResponse(
        res,
        `Access denied. Required role: ${allowedRoles.join(" or ")}.`,
        403
      );
    }

    next();
  };
};

// Shorthand middlewares
export const adminOnly = authorize("ADMIN");
export const analystAndAbove = authorize("ANALYST");
export const allRoles = authorize("VIEWER");