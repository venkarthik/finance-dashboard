import * as userService from "../services/user.service.js";
import { successResponse } from "../utils/response.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await userService.getAllUsers({ page, limit });
    return successResponse(res, result, "Users fetched.");
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return successResponse(res, { user }, "User fetched.");
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return successResponse(res, { user }, "User updated.");
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id, req.user.id);
    return successResponse(res, null, "User deleted.");
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    await userService.changePassword(req.user.id, req.body);
    return successResponse(res, null, "Password changed successfully.");
  } catch (err) {
    next(err);
  }
};