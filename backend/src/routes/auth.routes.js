import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../utils/schemas.js";

const router = Router();

// POST /api/auth/register
router.post("/register", validate(registerSchema), authController.register);

// POST /api/auth/login
router.post("/login", validate(loginSchema), authController.login);

// GET /api/auth/me  (protected)
router.get("/me", authenticate, authController.getMe);

export default router;