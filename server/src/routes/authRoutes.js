import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, signupSchema, updateProfileSchema } from "../validators/authValidators.js";

export const authRouter = Router();

authRouter.post("/signup", validate(signupSchema), authController.signup);
authRouter.post("/login", validate(loginSchema), authController.login);
authRouter.get("/me", protect, authController.me);
authRouter.patch("/me", protect, validate(updateProfileSchema), authController.updateMe);
