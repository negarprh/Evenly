import { useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";

export const useSocket = (groupId, handlers = {}) => {
  const { token } = useAuth();

  const socket = useMemo(() => {
    if (!token || !groupId) return null;
    return io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
      transports: ["websocket", "polling"]
    });
  }, [token, groupId]);

  useEffect(() => {
    if (!socket || !groupId) return undefined;

    socket.emit("group:join", groupId);
    if (handlers.onExpenseUpdated) socket.on("expense:updated", handlers.onExpenseUpdated);
    if (handlers.onBalancesUpdated) socket.on("group:balancesUpdated", handlers.onBalancesUpdated);

    return () => {
      socket.emit("group:leave", groupId);
      socket.disconnect();
    };
  }, [socket, groupId, handlers.onExpenseUpdated, handlers.onBalancesUpdated]);

  return socket;
};
