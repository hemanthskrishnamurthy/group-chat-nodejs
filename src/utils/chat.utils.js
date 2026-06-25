const crypto = require("crypto");

function getTimestamp() {
  return new Date().toISOString();
}

function validateUsername(username) {
  if (typeof username !== "string") {
    return {
      isValid: false,
      message: "Username is required"
    };
  }

  const trimmedUsername = username.trim();

  if (!trimmedUsername) {
    return {
      isValid: false,
      message: "Username cannot be empty"
    };
  }

  if (trimmedUsername.length < 2 || trimmedUsername.length > 30) {
    return {
      isValid: false,
      message: "Username must be between 2 and 30 characters"
    };
  }

  return {
    isValid: true,
    username: trimmedUsername
  };
}

function validateMessage(message) {
  if (typeof message !== "string") {
    return {
      isValid: false,
      message: "Message is required"
    };
  }

  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    return {
      isValid: false,
      message: "Message cannot be empty"
    };
  }

  if (trimmedMessage.length > 500) {
    return {
      isValid: false,
      message: "Message cannot be longer than 500 characters"
    };
  }

  return {
    isValid: true,
    message: trimmedMessage
  };
}

function createSystemMessage(message) {
  return {
    message,
    timestamp: getTimestamp()
  };
}

function createChatMessage({ username, message, socketId }) {
  return {
    id: crypto.randomUUID(),
    username,
    message,
    timestamp: getTimestamp(),
    socketId
  };
}

function createErrorMessage(message) {
  return {
    message
  };
}

module.exports = {
  getTimestamp,
  validateUsername,
  validateMessage,
  createSystemMessage,
  createChatMessage,
  createErrorMessage
};
