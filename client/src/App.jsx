import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { AppRouter } from "./routes/AppRouter.jsx";

/**
 * App — root component.
 *
 * Provider order:
 * 1. ThemeProvider  — no dependencies
 * 2. AuthProvider   — provides user + token
 * 3. SocketProvider — reads token from AuthContext to connect socket
 * 4. AppRouter      — all pages can now read theme, auth, and socket
 */
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <AppRouter />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}