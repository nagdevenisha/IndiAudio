// socket.js
import { io } from "socket.io-client";

let socket = null;

export const initSocket = (user) => {
  if (!socket && user) {
    socket = io("http://localhost:3001", {
      query: {
        userId: user.username,
        role: user.role,
        name: user.fullname,
      },
    });
    console.log(user);
  }
  return socket;
};

export const getSocket = () => socket;
