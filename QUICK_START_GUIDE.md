# 🚀 Quick Start Guide - Chat API with Swagger

## ⚡ TL;DR

**Start the server:**
```bash
yarn start:dev
```

**Open Swagger:**
```
http://localhost:3000/api
```

**Authorize:**
1. Login at `POST /auth/login`
2. Copy the `access_token`
3. Click **🔓 Authorize** button
4. Paste token → Click **Authorize**

**Send a chat message:**
```
POST /chat/messages
{
  "receiverId": "user-uuid",
  "content": "Hello!"
}
```

✅ **Done!** No more "Unauthorized" errors!

---

## 📋 Step-by-Step Guide

### Step 1: Start the Application
```bash
yarn start:dev
```

Wait for:
```
Nest application successfully started
```

### Step 2: Access Swagger UI
Open your browser:
```
http://localhost:3000/api
```

You'll see all your API endpoints organized by sections:
- 🔐 **Auth** - Login & Registration
- 👤 **Users** - User management
- 💬 **Chat** - NEW! Chat endpoints

### Step 3: Authenticate

#### 3.1 Login (if you don't have a token)
1. Expand `POST /auth/login`
2. Click **Try it out**
3. Enter credentials:
   ```json
   {
     "email": "your@email.com",
     "password": "yourpassword"
   }
   ```
4. Click **Execute**
5. Copy the `access_token` from the response

#### 3.2 Authorize in Swagger
1. Look for the **🔓 Authorize** button (top right)
2. Click it
3. Paste your token in the "Value" field
4. Click **Authorize**
5. Click **Close**

🎉 **You're now authenticated!** All protected endpoints will work.

### Step 4: Try Chat Endpoints

#### 4.1 Send a Message
1. Expand `POST /chat/messages`
2. Click **Try it out**
3. Enter:
   ```json
   {
     "receiverId": "paste-user-uuid-here",
     "content": "Hello from Swagger!"
   }
   ```
4. Click **Execute**
5. See the response with message details

#### 4.2 Get Message History
1. Expand `GET /chat/messages/{otherUserId}`
2. Click **Try it out**
3. Enter the other user's UUID
4. Click **Execute**
5. See all messages between you and that user

#### 4.3 Get WebSocket Info
1. Expand `GET /chat/info`
2. Click **Try it out**
3. Click **Execute**
4. See WebSocket connection details

---

## 🎯 Chat API Endpoints

### 1. POST /chat/messages
**Send a message via REST API**

**Request:**
```json
{
  "receiverId": "123e4567-e89b-12d3-a456-426614174000",
  "content": "Hey, how are you?"
}
```

**Response:**
```json
{
  "id": 1,
  "content": "Hey, how are you?",
  "senderId": "your-id",
  "senderName": "Your Name",
  "receiverId": "123e4567-e89b-12d3-a456-426614174000",
  "receiverName": "Other User",
  "createdAt": "2025-10-14T12:00:00Z"
}
```

### 2. GET /chat/messages/:otherUserId
**Get all messages with a specific user**

**Response:**
```json
[
  {
    "id": 1,
    "content": "Message 1",
    "senderId": "user1",
    "senderName": "User One",
    "receiverId": "user2",
    "receiverName": "User Two",
    "createdAt": "2025-10-14T12:00:00Z"
  }
]
```

### 3. GET /chat/info
**Get WebSocket connection details**

Returns information about:
- WebSocket URL
- How to authenticate
- Available events
- Payload formats

---

## 🔧 Common Tasks

### Get Your User ID
After logging in, your JWT token contains your user ID. Decode it at [jwt.io](https://jwt.io):

```json
{
  "sub": "your-user-id-here",  // ← This is your ID
  "email": "your@email.com"
}
```

### Test with Multiple Users
1. **Browser 1**: Login as User A, authorize in Swagger
2. **Browser 2 (Incognito)**: Login as User B, authorize in Swagger
3. Send messages between them using their UUIDs

### Find Other Users
Use existing user endpoints:
```
GET /users
```

---

## ❓ Troubleshooting

### "Unauthorized" Error
**Problem**: Endpoints return 401 Unauthorized

**Solution**:
1. Make sure you clicked **Authorize** button
2. Check your token hasn't expired (login again)
3. Verify you copied the full token

### "Receiver not found"
**Problem**: Can't send message

**Solution**:
1. Verify the `receiverId` is a valid UUID
2. Check the user exists: `GET /users/{id}`
3. Make sure you're using the correct user ID format

### Can't see Chat endpoints
**Problem**: Chat section missing in Swagger

**Solution**:
1. Restart server: `yarn start:dev`
2. Clear browser cache
3. Refresh Swagger page

### Token Expired
**Problem**: Authentication stops working

**Solution**:
1. Login again: `POST /auth/login`
2. Get new token
3. Re-authorize in Swagger

---

## 💡 Pro Tips

### 1. Keep Token Handy
Save your token in a text file for quick copy/paste:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Use the HTML Test Client
For WebSocket testing:
```bash
open chat-test-client.html
```

### 3. Check Response Schemas
Click on response examples in Swagger to see the full data structure.

### 4. Use Try It Out
Every endpoint has a "Try it out" button - use it to test instantly!

### 5. Download OpenAPI Spec
Click "Download" in Swagger to get the OpenAPI JSON for use in tools like Postman.

---

## 📚 More Resources

- **Complete Chat Documentation**: `CHAT_SYSTEM.md`
- **Swagger Integration Details**: `SWAGGER_INTEGRATION_SUMMARY.md`
- **Detailed Swagger Guide**: `SWAGGER_CHAT_GUIDE.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`

---

## 🎉 You're All Set!

Your Chat API is fully integrated with Swagger and ready to use. The JWT authentication works seamlessly - just login, authorize once, and all endpoints work!

### Quick Checklist
- [x] Server running (`yarn start:dev`)
- [x] Swagger opened (`http://localhost:3000/api`)
- [x] Logged in (`POST /auth/login`)
- [x] Authorized (🔓 button)
- [ ] Send your first message! 💬

**Happy chatting!** 🚀


