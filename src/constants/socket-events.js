const CLIENT_EVENTS = {
  JOIN_CHAT: "join_chat",
  SEND_MESSAGE: "send_message",
  TYPING: "typing",
  STOP_TYPING: "stop_typing"
};

const SERVER_EVENTS = {
  WELCOME_MESSAGE: "welcome_message",
  SYSTEM_MESSAGE: "system_message",
  RECEIVE_MESSAGE: "receive_message",
  ONLINE_USERS: "online_users",
  USER_TYPING: "user_typing",
  USER_STOP_TYPING: "user_stop_typing",
  CHAT_ERROR: "chat_error"
};

module.exports = {
  CLIENT_EVENTS,
  SERVER_EVENTS
};
