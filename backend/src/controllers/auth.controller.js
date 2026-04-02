import * as authService from "../services/auth.service.js";
import { successResponse } from "../utils/response.js";

export const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.registerUser(req.body);
    return successResponse(res, { user, token }, "Registration successful.", 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.loginUser(req.body);
    return successResponse(res, { user, token }, "Login successful.");
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return successResponse(res, { user }, "Profile fetched.");
  } catch (err) {
    next(err);
  }
};