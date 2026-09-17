export const startupErrorMessage = (error) => {
  if (["ENOTFOUND", "ENODATA"].includes(error.code) && error.syscall === "querySrv") {
    return "MongoDB hostname could not be resolved. Check that your Atlas cluster is active, then copy its connection string from Connect > Drivers into MONGODB_URI in server/.env. Restart the server after updating it.";
  }
  if (error.name === "MongoServerSelectionError" || error.name === "MongooseServerSelectionError") {
    return "Cannot reach MongoDB. Check that the database is running, the connection address is correct, and your network can reach it. For Atlas, check the project IP access list.";
  }
  if (error.code === 18) {
    return "MongoDB authentication failed. Check the database username and password in server/.env.";
  }
  // Driver errors can include credentials or connection strings.
  return "Server startup failed. Check MONGODB_URI and JWT_SECRET in server/.env and confirm MongoDB is available.";
};
