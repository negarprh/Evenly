import http from "http";
import { connectDB } from "./config/db.js";
import { ensureEnv, env } from "./config/env.js";
import { createApp } from "./app.js";
import { initializeSocket } from "./sockets/socket.js";

ensureEnv();

const app = createApp();
const server = http.createServer(app);
initializeSocket(server);

await connectDB();

server.listen(env.port, () => {
  console.log(`Evenly API listening on port ${env.port}`);
});
