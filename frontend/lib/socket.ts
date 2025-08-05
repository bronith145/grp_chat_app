import { io, Socket } from "socket.io-client";

let socket: Socket;

export const connectSocket = (token: string) => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      auth: { token },
    });
  }
  return socket;
};

export const getSocket = () => socket;
