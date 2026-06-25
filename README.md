# Real-Time Group Chat Backend

A beginner-friendly Node.js backend for a real-time group chat application. It uses Express for HTTP endpoints and Socket.IO for instant two-way communication between the server and connected clients.

This is version 1 of the backend:

- No database
- No authentication
- No chat rooms
- Temporary user data is stored in memory with a JavaScript `Map`
- Ready to connect later with any frontend client, including Angular

## Folder Structure

```text
chat-backend/
├── src/
│   ├── server.js
│   ├── socket/
│   │   └── chat.socket.js
│   ├── constants/
│   │   └── socket-events.js
│   └── utils/
│       └── chat.utils.js
├── package.json
├── .env.example
└── README.md
```

## Installation

```bash
npm install
```

## Environment Setup

Create a `.env` file in the `chat-backend` folder. You can copy the example file:

```bash
cp .env.example .env
```

Example values:

```env
PORT=3000
CLIENT_URL=http://localhost:4200
```

`PORT` is the port used by the backend server. `CLIENT_URL` is the allowed frontend origin for CORS and Socket.IO connections.

## Run Commands

Run in development mode with Nodemon:

```bash
npm run dev
```

Run in normal mode:

```bash
npm start
```

The server uses `PORT` from the environment and falls back to `3000`.

## Health Check

### Request

```http
GET /health
```

Example URL:

```text
http://localhost:3000/health
```

### Response

```json
{
  "status": "success",
  "message": "Chat server is running"
}
```

## In-Memory User Storage

Connected users are stored in a JavaScript `Map`.

```js
key: socket.id

value: {
  username: string,
  joinedAt: Date
}
```

This data is temporary. It is cleared when the server restarts.

## Socket.IO Events

### Client-to-Server Events

These events are emitted by the client and listened to by the backend.

| Event | Purpose |
| --- | --- |
| `join_chat` | Join the chat with a username |
| `send_message` | Send a chat message |
| `typing` | Tell others the user is typing |
| `stop_typing` | Tell others the user stopped typing |

### Server-to-Client Events

These events are emitted by the backend and listened to by clients.

| Event | Purpose |
| --- | --- |
| `welcome_message` | Sent only to the user who joined |
| `system_message` | Sent when users join or leave |
| `receive_message` | Sent when a chat message is broadcast |
| `online_users` | Sent when the online user count changes |
| `user_typing` | Sent when another user is typing |
| `user_stop_typing` | Sent when another user stopped typing |
| `chat_error` | Sent when a client sends invalid data |

## Event Documentation

### `join_chat`

Client sends:

```json
{
  "username": "Hemanth"
}
```

Validation rules:

- Username is required
- Username cannot be empty
- Whitespace is trimmed
- Username length must be between 2 and 30 characters

Server sends `welcome_message` only to the newly joined user:

```json
{
  "message": "Welcome to the chat, Hemanth!",
  "timestamp": "2026-06-25T10:30:00.000Z"
}
```

Server broadcasts `system_message` to other users:

```json
{
  "message": "Hemanth joined the chat",
  "timestamp": "2026-06-25T10:30:00.000Z"
}
```

Server emits `online_users` to all connected users:

```json
{
  "count": 3
}
```

### `send_message`

Client sends:

```json
{
  "message": "Hello everyone"
}
```

Validation rules:

- User must join before sending messages
- Message is required
- Message cannot be empty
- Whitespace is trimmed
- Message length cannot be greater than 500 characters

Server emits `receive_message` to all connected users:

```json
{
  "id": "unique-message-id",
  "username": "Hemanth",
  "message": "Hello everyone",
  "timestamp": "2026-06-25T10:31:00.000Z",
  "socketId": "sender socket id"
}
```

### `typing`

Client sends:

```json
{
  "isTyping": true
}
```

The user must join before sending typing events. When `isTyping` is `true`, the server broadcasts `user_typing` to all users except the sender:

```json
{
  "username": "Hemanth",
  "socketId": "sender socket id"
}
```

### `stop_typing`

Client sends the event without a payload.

The user must join before sending this event. The server broadcasts `user_stop_typing` to all users except the sender:

```json
{
  "username": "Hemanth",
  "socketId": "sender socket id"
}
```

### `disconnect`

Socket.IO fires `disconnect` automatically when a client disconnects.

Server behavior:

- Reads the username from the in-memory `Map`
- Removes the user from the `Map`
- Broadcasts a `system_message` to remaining users
- Emits the updated `online_users` count
- Logs the socket ID and disconnect reason

Server broadcasts:

```json
{
  "message": "Hemanth left the chat",
  "timestamp": "2026-06-25T10:32:00.000Z"
}
```

Server emits:

```json
{
  "count": 2
}
```

### `chat_error`

Server sends this when a client sends invalid data or tries to send chat activity before joining.

```json
{
  "message": "Username is required"
}
```

Other possible messages include:

- `Username cannot be empty`
- `Username must be between 2 and 30 characters`
- `Please join the chat before sending messages`
- `Message is required`
- `Message cannot be empty`
- `Message cannot be longer than 500 characters`

## Socket.IO Concepts Used

### `io.on("connection")`

Runs when a new client connects to the Socket.IO server. Each connected client gets its own `socket` object.

### `socket.on()`

Listens for an event from one specific connected client.

Example:

```js
socket.on("send_message", (payload) => {
  // Handle message from this client
});
```

### `socket.emit()`

Sends an event only to the current connected client.

Example use in this project: sending `welcome_message` only to the user who joined.

### `io.emit()`

Sends an event to every connected client, including the sender.

Example use in this project: broadcasting `receive_message` and `online_users`.

### `socket.broadcast.emit()`

Sends an event to every connected client except the sender.

Example use in this project: broadcasting join, leave, typing, and stop typing notifications to other users.

### `disconnect`

An automatic Socket.IO event that runs when a client closes the connection, refreshes the page, loses network connection, or disconnects manually.

## Testing With Postman Socket.IO

You can test this backend without building a frontend.

1. Start the server:

   ```bash
   npm run dev
   ```

2. Open Postman.

3. Create a new Socket.IO request.

4. Connect to:

   ```text
   http://localhost:3000
   ```

5. Emit `join_chat` with:

   ```json
   {
     "username": "Hemanth"
   }
   ```

6. Listen for these events:

   ```text
   welcome_message
   system_message
   receive_message
   online_users
   user_typing
   user_stop_typing
   chat_error
   ```

7. Open a second Socket.IO request in Postman and connect to the same server.

8. Emit `join_chat` from the second client with another username.

9. Emit `send_message` from either client:

   ```json
   {
     "message": "Hello everyone"
   }
   ```

10. Emit `typing` from one client:

    ```json
    {
      "isTyping": true
    }
    ```

11. Emit `stop_typing` from the same client without a payload.

12. Disconnect one client and check that the other client receives a leave `system_message` and updated `online_users` count.

## Notes

- This backend stores users in memory, so all connected user data is lost when the server restarts.
- This version intentionally does not include authentication, database persistence, or rooms.
- All event names are stored in `src/constants/socket-events.js`.
- All validation and payload creation helpers are stored in `src/utils/chat.utils.js`.
- All Socket.IO chat behavior is stored in `src/socket/chat.socket.js`.
