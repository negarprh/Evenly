export const sendSuccess = (res, data, message = "Success", statusCode = 200, extras = {}) => {
  res.status(statusCode).json({
    success: true,
    data,
    message,
    ...extras
  });
};
