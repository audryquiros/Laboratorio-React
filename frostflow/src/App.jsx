import AppRouter from "./routes/AppRouter";
import AuthProvider from "./context/AuthContext";
import ThemeProvider from "./context/ThemeContext";
import "./styles/Theme.css";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;