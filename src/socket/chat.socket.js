const { CLIENT_EVENTS, SERVER_EVENTS } = require("../constants/socket-events");
const {
  getTimestamp,
  validateUsername,
  validateMessage,
  createSystemMessage,
  createChatMessage,
  createErrorMessage
} = require("../utils/chat.utils");

// This Map stores connected users only while the server is running.
// key: socket.id
// value: { username: string, joinedAt: Date }
const connectedUsers = new Map();

function emitOnlineUserCount(io) {
  io.emit(SERVER_EVENTS.ONLINE_USERS, {
    count: connectedUsers.size
  });
}

function getJoinedUser(socket) {
  return connectedUsers.get(socket.id);
}

function registerChatSocket(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on(CLIENT_EVENTS.JOIN_CHAT, (payload = {}) => {
      const validation = validateUsername(payload.username);

      if (!validation.isValid) {
        socket.emit(SERVER_EVENTS.CHAT_ERROR, createErrorMessage(validation.message));
        return;
      }

      const { username } = validation;

      connectedUsers.set(socket.id, {
        username,
        joinedAt: new Date()
      });

      socket.emit(SERVER_EVENTS.WELCOME_MESSAGE, {
        message: `Welcome to the chat, ${username}!`,
        timestamp: getTimestamp()
      });

      socket.broadcast.emit(
        SERVER_EVENTS.SYSTEM_MESSAGE,
        createSystemMessage(`${username} joined the chat`)
      );

      emitOnlineUserCount(io);
    });

    socket.on(CLIENT_EVENTS.SEND_MESSAGE, (payload = {}) => {
      const user = getJoinedUser(socket);

      if (!user) {
        socket.emit(
          SERVER_EVENTS.CHAT_ERROR,
          createErrorMessage("Please join the chat before sending messages")
        );
        return;
      }

      const validation = validateMessage(payload.message);

      if (!validation.isValid) {
        socket.emit(SERVER_EVENTS.CHAT_ERROR, createErrorMessage(validation.message));
        return;
      }

      const chatMessage = createChatMessage({
        username: user.username,
        message: validation.message,
        socketId: socket.id
      });

      io.emit(SERVER_EVENTS.RECEIVE_MESSAGE, chatMessage);
    });

    socket.on(CLIENT_EVENTS.TYPING, (payload = {}) => {
      const user = getJoinedUser(socket);

      if (!user) {
        socket.emit(
          SERVER_EVENTS.CHAT_ERROR,
          createErrorMessage("Please join the chat before typing")
        );
        return;
      }

      if (payload.isTyping !== true) {
        return;
      }

      socket.broadcast.emit(SERVER_EVENTS.USER_TYPING, {
        username: user.username,
        socketId: socket.id
      });
    });

    socket.on(CLIENT_EVENTS.STOP_TYPING, () => {
      const user = getJoinedUser(socket);

      if (!user) {
        socket.emit(
          SERVER_EVENTS.CHAT_ERROR,
          createErrorMessage("Please join the chat before stopping typing")
        );
        return;
      }

      socket.broadcast.emit(SERVER_EVENTS.USER_STOP_TYPING, {
        username: user.username,
        socketId: socket.id
      });
    });

    socket.on("disconnect", (reason) => {
      const user = getJoinedUser(socket);

      connectedUsers.delete(socket.id);

      if (user) {
        socket.broadcast.emit(
          SERVER_EVENTS.SYSTEM_MESSAGE,
          createSystemMessage(`${user.username} left the chat`)
        );

        emitOnlineUserCount(io);
      }

      console.log(`Socket disconnected: ${socket.id}. Reason: ${reason}`);
    });
  });
}

module.exports = registerChatSocket;
