require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const registerChatSocket = require("./socket/chat.socket");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:4200";

// CORS allows the future frontend client to call the API and connect to Socket.IO.
app.use(
  cors({
    origin: CLIENT_URL
  })
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Chat server is running"
  });
});

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

registerChatSocket(io);

server.listen(PORT, () => {
  console.log(`Chat server is running on port ${PORT}`);
});
