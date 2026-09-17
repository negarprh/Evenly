import http from "http";
import { connectDB } from "./config/db.js";
import { ensureEnv, env } from "./config/env.js";
import { createApp } from "./app.js";
import { initializeSocket } from "./sockets/socket.js";
import { startupErrorMessage } from "./config/startupError.js";

try {
  ensureEnv();
  await connectDB();
} catch (error) {
  console.error(startupErrorMessage(error));
  process.exit(1);
}

const app = createApp();
const server = http.createServer(app);
initializeSocket(server);

server.listen(env.port, () => {
  console.log(`Evenly API listening on port ${env.port}`);
});
