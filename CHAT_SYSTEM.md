# Real-Time Chat System Documentation

## Overview

This is a production-ready, real-time user-to-user chat system built with NestJS, WebSockets (Socket.io), TypeORM, and JWT authentication.

## Architecture

### File Structure

```
src/chat/
├── chat.gateway.ts      # WebSocket gateway handling real-time events
├── chat.module.ts       # Module configuration
├── chat.service.ts      # Business logic for message operations
├── message.entity.ts    # Message database entity
└── ws-jwt.guard.ts      # WebSocket JWT authentication guard
```

### Database Schema

**Message Entity:**
- `id`: Auto-generated primary key
- `sender`: Many-to-One relationship with User
- `receiver`: Many-to-One relationship with User
- `content`: Text content of the message
- `createdAt`: Timestamp of message creation

**User Entity (updated):**
- Added `sentMessages`: One-to-Many relationship with Message
- Added `receivedMessages`: One-to-Many relationship with Message

## WebSocket Events

### Client → Server Events

#### 1. **send_message**

Send a message to another user.

**Payload:**
```json
{
  "receiverId": "user-uuid",
  "content": "Hello, how are you?"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": 123
}
```

**Real-time Emit (to both sender and receiver):**
Event: `receive_message`
```json
{
  "id": 123,
  "content": "Hello, how are you?",
  "senderId": "sender-uuid",
  "senderName": "John Doe",
  "receiverId": "receiver-uuid",
  "receiverName": "Jane Smith",
  "createdAt": "2025-10-14T12:00:00Z"
}
```

#### 2. **get_messages**

Retrieve all messages between the current user and another user.

**Payload:**
```json
{
  "otherUserId": "user-uuid"
}
```

**Response:**
Event: `messages_list`
```json
[
  {
    "id": 123,
    "content": "Hello!",
    "senderId": "user1-uuid",
    "senderName": "User 1",
    "receiverId": "user2-uuid",
    "receiverName": "User 2",
    "createdAt": "2025-10-14T12:00:00Z"
  },
  // ... more messages
]
```

### Server → Client Events

#### 1. **receive_message**

Emitted when a new message is sent (to both sender and receiver).

#### 2. **messages_list**

Emitted in response to `get_messages` event.

#### 3. **error**

Emitted when an error occurs.

**Payload:**
```json
{
  "message": "Error description"
}
```

## Authentication

The chat system uses JWT authentication. Users must provide a valid JWT token when connecting to the WebSocket server.

### Connection Methods

The token can be provided in two ways:

1. **Socket.io Auth Object:**
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

2. **Authorization Header:**
```javascript
const socket = io('http://localhost:3000', {
  extraHeaders: {
    authorization: 'Bearer your-jwt-token'
  }
});
```

### Token Validation

- Tokens are validated on connection using the same JWT secret as the REST API
- Invalid tokens will result in immediate disconnection
- The user's ID is extracted from the token payload (`sub` field)

## Usage Examples

### JavaScript/TypeScript Client

```typescript
import { io } from 'socket.io-client';

// Connect with authentication
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Connection event
socket.on('connect', () => {
  console.log('Connected to chat server');
});

// Send a message
socket.emit('send_message', {
  receiverId: 'recipient-user-id',
  content: 'Hello!'
});

// Listen for incoming messages
socket.on('receive_message', (message) => {
  console.log('New message:', message);
  // {
  //   id: 123,
  //   content: "Hello!",
  //   senderId: "...",
  //   senderName: "...",
  //   receiverId: "...",
  //   receiverName: "...",
  //   createdAt: "..."
  // }
});

// Get conversation history
socket.emit('get_messages', {
  otherUserId: 'other-user-id'
});

socket.on('messages_list', (messages) => {
  console.log('Conversation history:', messages);
});

// Handle errors
socket.on('error', (error) => {
  console.error('Error:', error.message);
});

// Disconnect
socket.on('disconnect', () => {
  console.log('Disconnected from chat server');
});
```

### React Example

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

function ChatComponent({ token, otherUserId }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io('http://localhost:3000', {
      auth: { token }
    });

    // Listen for incoming messages
    newSocket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Load conversation history
    newSocket.emit('get_messages', { otherUserId });
    
    newSocket.on('messages_list', (msgs) => {
      setMessages(msgs);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token, otherUserId]);

  const sendMessage = () => {
    if (socket && inputMessage.trim()) {
      socket.emit('send_message', {
        receiverId: otherUserId,
        content: inputMessage
      });
      setInputMessage('');
    }
  };

  return (
    <div>
      <div>
        {messages.map(msg => (
          <div key={msg.id}>
            <strong>{msg.senderName}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <input 
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
```

## Testing with Postman or Socket.io Client

1. **Install a Socket.io client tester** (e.g., Socket.io Client Tool browser extension)

2. **Connect to the server:**
   - URL: `http://localhost:3000` (or your server URL)
   - Auth: Add token in auth object

3. **Test sending a message:**
   ```json
   Event: send_message
   Data: {
     "receiverId": "user-uuid",
     "content": "Test message"
   }
   ```

4. **Test retrieving messages:**
   ```json
   Event: get_messages
   Data: {
     "otherUserId": "user-uuid"
   }
   ```

## Configuration

### Environment Variables

The chat system uses the existing JWT configuration from your `.env` file:

```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=60m
```

### CORS

CORS is enabled by default in the WebSocket gateway. To configure it:

```typescript
@WebSocketGateway({ 
  cors: {
    origin: 'http://localhost:3001', // Your frontend URL
    credentials: true
  }
})
```

## Features

✅ **Real-time Communication**: Instant message delivery using WebSockets
✅ **JWT Authentication**: Secure authentication using your existing JWT system
✅ **Message Persistence**: All messages stored in PostgreSQL
✅ **User Status Tracking**: Tracks online users automatically
✅ **Conversation History**: Retrieve full message history between users
✅ **Error Handling**: Comprehensive error handling and user feedback
✅ **Production Ready**: Clean, typed, and follows NestJS best practices

## Database Migration

To create the messages table, run:

```bash
# Start your application (TypeORM will auto-create if synchronize is enabled)
yarn start:dev

# Or create a migration (recommended for production)
yarn typeorm migration:create -n CreateMessagesTable
```

## Security Considerations

1. **JWT Token Security**: Tokens are validated on every connection
2. **User Authorization**: Users can only send messages as themselves
3. **Input Validation**: Message content is validated before storage
4. **SQL Injection Protection**: TypeORM provides protection against SQL injection
5. **XSS Protection**: Ensure frontend sanitizes message content before rendering

## Performance Optimization

- Messages are loaded with eager loading for sender/receiver
- QueryBuilder is used for efficient conversation queries
- Socket connections are tracked in memory for fast message delivery
- Consider implementing pagination for large conversation histories

## Future Enhancements

Potential additions:
- Read receipts
- Typing indicators
- Message deletion/editing
- File/image attachments
- Group chat functionality
- Message search
- Push notifications for offline users
- Message pagination

## Troubleshooting

### Connection Issues

**Problem**: Client can't connect to WebSocket server

**Solutions:**
- Verify the server is running
- Check CORS configuration
- Ensure JWT token is valid and not expired
- Check network/firewall settings

### Authentication Failures

**Problem**: Getting disconnected immediately after connecting

**Solutions:**
- Verify JWT token is being sent correctly
- Check token hasn't expired
- Ensure JWT_SECRET matches between auth and chat modules

### Messages Not Being Received

**Problem**: Messages are saved but not delivered in real-time

**Solutions:**
- Verify both users are connected
- Check browser console for errors
- Ensure event listeners are set up correctly

## Support

For issues or questions, please refer to the NestJS and Socket.io documentation:
- [NestJS WebSockets](https://docs.nestjs.com/websockets/gateways)
- [Socket.io Documentation](https://socket.io/docs/v4/)

