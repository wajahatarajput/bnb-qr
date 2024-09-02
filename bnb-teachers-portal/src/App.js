import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./providers";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./pages/login";
import QRForm from "./pages/class";
import QRPage from "./pages/attandance";
import CourseDetailsPage from "./pages/courses";
import CourseSessions from "./pages/courses/sessions";
import AttendanceRecords from "./pages/courses/attendance";
import EditAdminPage from "./pages/profile";

function App() {

  return (
    <AuthProvider>
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route exact path="/class" element={<ProtectedRoute> <QRForm /></ProtectedRoute>} />
        <Route exact path="/qr-page" element={<ProtectedRoute> <QRPage /></ProtectedRoute>} />
        <Route exact path="/courses" element={<ProtectedRoute> <CourseDetailsPage /></ProtectedRoute>} />
        <Route exact path="/course-sessions/:courseId" element={<ProtectedRoute><CourseSessions /></ProtectedRoute>} />

        <Route exact path="/profile/:id" element={<ProtectedRoute> <EditAdminPage /></ProtectedRoute>} />
        <Route path="/attendance/session/:sessionId" element={
          <ProtectedRoute>
            <AttendanceRecords />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;