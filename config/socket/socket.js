import { Server } from "socket.io";

const socketServer = (server) => {
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export default socketServer;
