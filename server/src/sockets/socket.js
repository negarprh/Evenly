import { Server } from "socket.io";
import { env } from "../config/env.js";
import { Group } from "../models/Group.js";
import { verifyToken } from "../services/authService.js";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next();

    try {
      const payload = verifyToken(token);
      socket.userId = payload.userId;
      next();
    } catch {
      next();
    }
  });

  io.on("connection", (socket) => {
    socket.on("group:join", async (groupId) => {
      if (!socket.userId) return;
      const group = await Group.findById(groupId);
      if (!group) return;
      const isMember = group.members.some((memberId) => String(memberId) === String(socket.userId));
      if (isMember) socket.join(`group:${groupId}`);
    });

    socket.on("group:leave", (groupId) => {
      socket.leave(`group:${groupId}`);
    });
  });

  return io;
};

export const emitExpenseChanged = (groupId, action, expense, balances) => {
  if (!io) return;
  io.to(`group:${groupId}`).emit("expense:updated", {
    action,
    expense,
    groupId: String(groupId)
  });
  io.to(`group:${groupId}`).emit("group:balancesUpdated", {
    groupId: String(groupId),
    balanceSummary: balances.summary,
    settlements: balances.settlements,
    balances
  });
};
