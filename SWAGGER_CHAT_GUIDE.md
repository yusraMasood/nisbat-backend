# Swagger Chat API Guide

## 🎯 Overview

The Chat module now includes both **REST API endpoints** (documented in Swagger) and **WebSocket** support for real-time messaging.

## 📝 Accessing Swagger Documentation

1. **Start the application:**
   ```bash
   yarn start:dev
   ```

2. **Open Swagger UI:**
   ```
   http://localhost:3000/api
   ```

## 🔐 Authentication in Swagger

To use the Chat APIs (and all protected endpoints) in Swagger:

### Step 1: Login
1. Find the **Auth** section in Swagger
2. Use the `POST /auth/login` endpoint
3. Enter your credentials:
   ```json
   {
     "email": "user@example.com",
     "password": "yourpassword"
   }
   ```
4. Copy the `access_token` from the response

### Step 2: Authorize
1. Click the **🔓 Authorize** button at the top right of Swagger UI
2. Paste your token in the "Value" field (no need to add "Bearer" - Swagger adds it automatically)
3. Click **Authorize**
4. Click **Close**

### Step 3: Use Chat APIs
Now all Chat endpoints will work without showing "Unauthorized"! 🎉

## 📡 Chat REST API Endpoints

### 1. POST /chat/messages
**Send a message via REST API**

**Request Body:**
```json
{
  "receiverId": "123e4567-e89b-12d3-a456-426614174000",
  "content": "Hello, how are you?"
}
```

**Response:**
```json
{
  "id": 1,
  "content": "Hello, how are you?",
  "senderId": "your-user-id",
  "senderName": "Your Name",
  "receiverId": "123e4567-e89b-12d3-a456-426614174000",
  "receiverName": "Receiver Name",
  "createdAt": "2025-10-14T12:00:00Z"
}
```

### 2. GET /chat/messages/:otherUserId
**Get conversation history with a user**

**Example:**
```
GET /chat/messages/123e4567-e89b-12d3-a456-426614174000
```

**Response:**
```json
[
  {
    "id": 1,
    "content": "Hello!",
    "senderId": "user1",
    "senderName": "User 1",
    "receiverId": "user2",
    "receiverName": "User 2",
    "createdAt": "2025-10-14T12:00:00Z"
  },
  {
    "id": 2,
    "content": "Hi there!",
    "senderId": "user2",
    "senderName": "User 2",
    "receiverId": "user1",
    "receiverName": "User 1",
    "createdAt": "2025-10-14T12:01:00Z"
  }
]
```

### 3. GET /chat/info
**Get WebSocket connection information**

Returns detailed information about:
- WebSocket URL
- How to connect with authentication
- Available WebSocket events
- Payload formats

## 🔌 WebSocket Real-Time Chat

For real-time bidirectional messaging, use WebSocket:

### Connection
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token' // Same token from Swagger
  }
});
```

### Events
- `send_message` - Send a message in real-time
- `receive_message` - Receive messages in real-time
- `get_messages` - Request conversation history
- `messages_list` - Receive conversation history

See `CHAT_SYSTEM.md` for complete WebSocket documentation.

## 🎨 Swagger Features

### API Tags
All Chat endpoints are grouped under the **"Chat"** tag in Swagger UI.

### Try It Out
1. Click on any endpoint
2. Click **"Try it out"**
3. Fill in the parameters/body
4. Click **"Execute"**
5. See the response below

### Response Schemas
Swagger shows detailed response schemas for:
- Success responses (200, 201)
- Error responses (401, 404)
- All data types and formats

## 🔑 Key Points

✅ **REST API** - Use for simple request/response patterns
✅ **WebSocket** - Use for real-time bidirectional messaging
✅ **Same JWT Token** - Works for both REST and WebSocket
✅ **Fully Documented** - All endpoints in Swagger with examples
✅ **Type-Safe** - DTOs with validation decorators

## 🚀 Testing Flow

1. **Register a user** (if needed):
   ```
   POST /auth/register
   ```

2. **Login**:
   ```
   POST /auth/login
   ```

3. **Copy token and authorize** in Swagger

4. **Send a message**:
   ```
   POST /chat/messages
   ```

5. **Get messages**:
   ```
   GET /chat/messages/{otherUserId}
   ```

6. **Get WebSocket info**:
   ```
   GET /chat/info
   ```

7. **Connect via WebSocket** for real-time features

## 📱 Frontend Integration

### REST API (Axios/Fetch)
```typescript
const token = 'your-jwt-token';

// Send message
await fetch('http://localhost:3000/chat/messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    receiverId: 'user-uuid',
    content: 'Hello!'
  })
});

// Get messages
const response = await fetch(
  `http://localhost:3000/chat/messages/${otherUserId}`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
const messages = await response.json();
```

### WebSocket (Socket.io)
```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token }
});

// Send message
socket.emit('send_message', {
  receiverId: 'user-uuid',
  content: 'Hello!'
});

// Receive messages
socket.on('receive_message', (message) => {
  console.log('New message:', message);
});
```

## 🛠️ Development Tips

### Check Current User
The JWT token contains your user ID. The API automatically extracts it using the `@CurrentUserId()` decorator.

### Get User ID
After login, decode the JWT (use jwt.io) to see:
```json
{
  "sub": "your-user-id",  // This is your user ID
  "email": "user@example.com",
  "iat": 1234567890
}
```

### Testing with Multiple Users
1. Open Swagger in two different browsers (or incognito)
2. Login as different users in each
3. Send messages between them
4. Or use the HTML test client: `chat-test-client.html`

## 📖 Additional Resources

- `CHAT_SYSTEM.md` - Complete WebSocket documentation
- `chat-test-client.html` - HTML test client
- `IMPLEMENTATION_SUMMARY.md` - Technical implementation details

## ❓ Troubleshooting

### "Unauthorized" Error
- Make sure you clicked **Authorize** in Swagger
- Check that your token hasn't expired
- Try logging in again to get a fresh token

### "Receiver not found" Error
- Make sure the `receiverId` is a valid user UUID
- Check that the user exists in the database

### Can't see Chat endpoints
- Restart the server: `yarn start:dev`
- Clear browser cache
- Check that ChatModule is imported in app.module.ts

## 🎉 You're Ready!

Your Chat API is now fully integrated with Swagger. You can test all endpoints directly from the Swagger UI with proper authentication! 🚀


