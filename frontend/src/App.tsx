import AppRoutes from "./routes/Routes.js";
import { SnackbarProvider } from "./context/SnackbarContext.js";
import { AuthProvider } from "./context/AuthContext.js";
import "./App.scss";

function App() {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <AppRoutes />
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
