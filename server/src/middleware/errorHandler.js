import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

export const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`, "ROUTE_NOT_FOUND"));
};

export const errorHandler = (err, _req, res, _next) => {
  const isKnown = err instanceof ApiError;
  const statusCode = isKnown ? err.statusCode : 500;

  if (!isKnown && env.nodeEnv !== "test") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: isKnown ? err.message : "Internal server error",
      code: isKnown ? err.code : "INTERNAL_SERVER_ERROR",
      details: isKnown ? err.details : []
    }
  });
};
