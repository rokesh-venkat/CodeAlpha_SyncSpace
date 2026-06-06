# Auth API Testing Guide — SyncSpace

Test the three auth endpoints using Thunder Client (VS Code extension) or Postman.

---

## Setup — Thunder Client

1. Open VS Code
2. Press `Ctrl+Shift+X` to open Extensions
3. Search **"Thunder Client"** and install it
4. Click the Thunder Client icon in the left sidebar (lightning bolt)
5. Click **"New Request"**

---

## Base URL

```
http://localhost:5000
```

Make sure your server is running:
```bash
cd server
npm run dev
```

Expected terminal output before testing:
```bash
MongoDB Connected: cluster0.xxxxx.mongodb.net
Server running on port 5000 [development]
```

---

## Test 1 — Health Check

**Method:** `GET`
**URL:** `http://localhost:5000/api/health`
**Headers:** none

**Expected Response (200):**
```json
{
  "success": true,
  "message": "SyncSpace API is running",
  "environment": "development"
}
```

---

## Test 2 — Register

**Method:** `POST`
**URL:** `http://localhost:5000/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Rokee",
  "email": "rokee@example.com",
  "password": "123456"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Rokee",
    "email": "rokee@example.com",
    "avatar": "",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error — duplicate email (409):**
```json
{
  "success": false,
  "message": "An account with that email already exists"
}
```

**Error — missing fields (400):**
```json
{
  "success": false,
  "message": "Please provide name, email, and password"
}
```

---

## Test 3 — Login

**Method:** `POST`
**URL:** `http://localhost:5000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "rokee@example.com",
  "password": "123456"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Rokee",
    "email": "rokee@example.com",
    "avatar": "",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error — wrong credentials (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

> ⚠️ Copy the `token` value from the login response — you need it for Test 4.

---

## Test 4 — Get Current User (Protected)

**Method:** `GET`
**URL:** `http://localhost:5000/api/auth/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace the token after `Bearer ` with the token you copied from the login response.

**Expected Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Rokee",
    "email": "rokee@example.com",
    "avatar": "",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error — no token (401):**
```json
{
  "success": false,
  "message": "Not authorized — no token provided"
}
```

**Error — expired token (401):**
```json
{
  "success": false,
  "message": "Session expired — please log in again"
}
```

---

## Thunder Client — Environment Variables (optional)

To avoid pasting the token manually each time:

1. Click **"Env"** in Thunder Client sidebar
2. Click **"New Environment"** → name it `SyncSpace Dev`
3. Add variable: `baseUrl` = `http://localhost:5000`
4. Add variable: `token` = *(paste from login response)*
5. Use `{{baseUrl}}/api/auth/me` in URL fields
6. Use `Bearer {{token}}` in Authorization header

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `ECONNREFUSED` | Server isn't running — run `npm run dev` in `server/` |
| `MongooseError` | Check `.env` MONGO_URI is correct |
| `401 no token` | Add `Authorization: Bearer <token>` header |
| `401 invalid token` | Token copied incorrectly — re-login and copy fresh |
| `Cannot find module` | Run `npm install` in `server/` |