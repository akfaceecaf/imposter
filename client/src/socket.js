import { io } from "socket.io-client";
const SERVER_URL = import.meta.env.SERVER_URL || "http://localhost:3000/";
const socket = io(SERVER_URL, {
  autoConnect: true,
  auth: { sessionID: sessionStorage.getItem("sessionID") },
});

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
