import { Server as HttpServer } from "http";
import { Socket, Server as SocketServer } from "socket.io";
import { ChatService } from "../../services/Chat.service.js";
import { verifyAccessToken } from "../Token.js";

export function initSocket(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  // ─── Auth middleware ────────────────────────────────────────────────────────
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth["token"];
      if (!token) return next(new Error("No token"));
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  // ─── Connection ─────────────────────────────────────────────────────────────
  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;

    // Join a room
    socket.on("room:join", (roomId: string) => {
      socket.join(roomId);
    });

    // Leave a room
    socket.on("room:leave", (roomId: string) => {
      socket.leave(roomId);
    });

    // Send a message
    socket.on("message:send", async ({ roomId, content, type = "text" }) => {
      try {
        const message = await ChatService.sendMessage(
          roomId,
          userId,
          content,
          type,
        );
        // Broadcast to everyone in the room including sender
        io.to(roomId).emit("message:new", message);
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });

    // Typing indicator
    socket.on("typing:start", ({ roomId }) => {
      socket.to(roomId).emit("typing:start", { userId });
    });

    socket.on("typing:stop", ({ roomId }) => {
      socket.to(roomId).emit("typing:stop", { userId });
    });

    // Mark messages as read
    socket.on("messages:read", async ({ roomId }) => {
      try {
        await ChatService.markAsRead(roomId, userId);
        socket.to(roomId).emit("messages:read", { userId, roomId });
      } catch {}
    });

    socket.on("disconnect", () => {});
  });

  return io;
}
