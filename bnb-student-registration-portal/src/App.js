import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./providers";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./pages/login";
import Home from "./pages/home";
import QRCodeScanner from "./pages/scanner";
import History from "./pages/history";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route exact path="/dashboard" element={<ProtectedRoute> <Home /></ProtectedRoute>} />
        <Route exact path="/scanner" element={<ProtectedRoute> <QRCodeScanner /></ProtectedRoute>} />
        <Route exact path="/history" element={<ProtectedRoute> <History /></ProtectedRoute>} />

      </Routes>
    </AuthProvider>
  );
}

export default App;