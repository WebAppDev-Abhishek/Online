/**
 * Custom Node server that serves Next.js + Socket.io
 * for real-time chat & WebRTC signaling.
 *
 * Usage: npm run dev:socket  (or npm run start:socket in production)
 */
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

type Presence = { userId: string; role: string };

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketServer(httpServer, {
    path: "/api/socketio",
    cors: { origin: "*" },
  });

  const sockets = new Map<string, Presence>();
  const adminSockets = new Set<string>();

  io.on("connection", (socket) => {
    socket.on("join", (payload: Presence) => {
      sockets.set(socket.id, payload);
      if (payload.role === "ADMIN") adminSockets.add(socket.id);
      socket.join(`user:${payload.userId}`);
      if (payload.role === "ADMIN") socket.join("admins");
    });

    socket.on(
      "message",
      (msg: { conversationId?: string; sender?: { id: string } }) => {
        if (msg.conversationId) {
          socket.to("admins").emit("message", msg);
          socket.broadcast.emit("message", msg);
        }
      }
    );

    socket.on(
      "typing",
      (payload: { conversationId: string; typing: boolean }) => {
        socket.broadcast.emit("typing", payload);
      }
    );

    socket.on(
      "call:offer",
      (payload: { to: string; from: string; offer: unknown }) => {
        if (payload.to === "admin") {
          io.to("admins").emit("call:incoming", payload);
        } else {
          io.to(`user:${payload.to}`).emit("call:incoming", payload);
        }
      }
    );

    socket.on(
      "call:answer",
      (payload: { to?: string; answer: unknown }) => {
        if (payload.to) {
          io.to(`user:${payload.to}`).emit("call:answer", payload);
        } else {
          socket.broadcast.emit("call:answer", payload);
        }
      }
    );

    socket.on(
      "call:ice",
      (payload: { to: string; candidate: unknown }) => {
        if (payload.to === "admin") {
          io.to("admins").emit("call:ice", payload);
        } else {
          io.to(`user:${payload.to}`).emit("call:ice", payload);
        }
      }
    );

    socket.on("call:ended", (payload: { to: string }) => {
      if (payload.to === "admin") {
        io.to("admins").emit("call:ended", payload);
      } else {
        io.to(`user:${payload.to}`).emit("call:ended", payload);
      }
    });

    socket.on("disconnect", () => {
      sockets.delete(socket.id);
      adminSockets.delete(socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> PCB Online ready on http://${hostname}:${port}`);
    console.log(`> Socket.io path: /api/socketio`);
  });
});
