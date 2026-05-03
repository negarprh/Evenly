import { User } from "../models/User.js";
import { verifyToken } from "../services/authService.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, "Authentication required", "AUTH_REQUIRED");
  }

  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.userId);
    if (!user) throw new ApiError(401, "User no longer exists", "AUTH_USER_NOT_FOUND");
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, "Invalid or expired token", "INVALID_TOKEN");
  }
});
