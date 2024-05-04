import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./providers";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./pages/login";
import Home from "./pages/home";
import QRForm from "./pages/class";
import QRPage from "./pages/attandance";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route exact path="/class" element={<ProtectedRoute> <QRForm /></ProtectedRoute>} />
        <Route exact path="/qr-page" element={<ProtectedRoute> <QRPage /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;