import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AppRouter } from "./routes/AppRouter.jsx";

/**
 * App — root component.
 *
 * Provider order matters:
 * 1. ThemeProvider — sets the CSS class on <html>, no auth dependency
 * 2. AuthProvider — manages JWT + user state, wraps the whole router
 * 3. AppRouter    — can now read both theme and auth context anywhere
 */
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}