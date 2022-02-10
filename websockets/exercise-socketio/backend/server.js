import http from "http";
import handler from "serve-handler";
import nanobuffer from "nanobuffer";
import { Server } from "socket.io";

const msg = new nanobuffer(50);
const getMsgs = () => Array.from(msg).reverse();

msg.push({
  user: "brian",
  text: "hi",
  time: Date.now(),
});

// serve static assets
const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: "./frontend",
  });
});

const socketServer = new Server(server, {});

socketServer.on('connect', (socket) => {
  console.log("Socket connected: " + socket.id);
  
  socket.emit('message.get', { msg: getMsgs() });
  
  socket.on('message.post', (data) => {
    msg.push({
      text: data.text,
      user: data.user,
      time: Date.now(),
    });
    
    socketServer.emit('message.get', { msg: getMsgs() });
  });
});

socketServer.on('disconnect', (socket) => {
  console.log("Socket disconnected: " + socket.id);
});

const port = process.env.PORT || 40001;

server.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
