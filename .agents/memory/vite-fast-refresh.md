---
name: Vite Fast Refresh hook/component split
description: AuthContext and SocketContext must not export both a component and a hook in the same file, or Vite recreates the context on HMR.
---

**Rule:** Any file that exports a React Context Provider (component) must NOT also export the `useXxx` hook. Split them into separate files.

**Why:** Vite Fast Refresh only works when a file exports EITHER components OR non-component functions, not both. When it can't fast-refresh, it invalidates the module, which creates a NEW `createContext()` object. The `AuthProvider` then wraps children with the NEW context, but components that already imported the OLD context object call `useContext(oldCtx)` and get `null` → crash "must be used within AuthProvider".

**How to apply:**
- `context/AuthContext.jsx` — exports ONLY `AuthContext` (the context object) and `AuthProvider` (component).
- `hooks/useAuth.js` — exports `useAuth()`, imports `AuthContext` from AuthContext.jsx.
- `context/SocketContext.jsx` — exports ONLY `SocketContext` and `SocketProvider`.
- `hooks/useSocket.js` — exports `useSocket()`, imports `SocketContext` from SocketContext.jsx.
- Same pattern applies to any future context files.
