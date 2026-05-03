import * as authService from "../services/authService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/responses.js";

export const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.validated.body);
  sendSuccess(res, result, "Account created successfully", 201);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.validated.body);
  sendSuccess(res, result, "Logged in successfully");
});

export const me = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: req.user }, "Current user fetched");
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.validated.body);
  sendSuccess(res, { user }, "Profile updated successfully");
});
