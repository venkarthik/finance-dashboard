import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { adminOnly } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { updateUserSchema, changePasswordSchema } from "../utils/schemas.js";

const router = Router();

// All user routes require authentication
router.use(authenticate);

// GET /api/users              → Admin only
router.get("/", adminOnly, userController.getAllUsers);

// GET /api/users/:id          → Admin only
router.get("/:id", adminOnly, userController.getUserById);

// PUT /api/users/:id          → Admin only (update role/status/name)
router.put("/:id", adminOnly, validate(updateUserSchema), userController.updateUser);

// DELETE /api/users/:id       → Admin only
router.delete("/:id", adminOnly, userController.deleteUser);

// PUT /api/users/me/password  → Any authenticated user (change own password)
router.put("/me/password", validate(changePasswordSchema), userController.changePassword);

export default router;