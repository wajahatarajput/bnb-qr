import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./providers";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./pages/login";
import Home from "./pages/home";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route exact path="/dashboard" element={<ProtectedRoute> <Home /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;