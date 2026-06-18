---
name: Socket event names must be synced
description: Client and server socket event constants must use identical string values; mismatches cause silent failures.
---

**Rule:** `client/src/utils/socketEvents.js` and `server/src/sockets/events.js` must agree on the same string values for every event.

**Why:** Socket.IO matches events by string. If the client emits "webrtc:mute" but the server listens for "webrtc:toggleAudio", the event is silently dropped.

**How to apply:**
- Server `events.js` uses aliasing for backward compat: `PRESENCE_ONLINE: "user:online"` makes old presenceSocket code emit the same event client expects.
- Client socketEvents.js has `MESSAGE_REACTION: "message:react"` matching server `MESSAGE_REACT: "message:react"`.
- When adding new events, add to BOTH files with the same string value.
- Server `signalingSocket.js` tracks room via `socket.currentRoom` (set by roomSocket on ROOM_JOIN), NOT `socket.roomId`.
