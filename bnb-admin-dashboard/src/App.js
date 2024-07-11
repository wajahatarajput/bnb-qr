import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./providers";
import ProtectedRoute from "./ProtectedRoute";
// import { SignUp } from "./pages/signup";
import Login from "./pages/login";
import ManageStudents from "./pages/student/manage";
import AddStudentPage from "./pages/student/add";
import EditStudentPage from "./pages/student/edit";
import ManageTeachers from "./pages/teacher/manage";
import EditTeacherPage from "./pages/teacher/edit";
import AddTeacherPage from "./pages/teacher/add";
import CreateCourse from "./pages/course/create";
import ManageCourses from "./pages/course/manage";
import EditCourse from "./pages/course/edit";
import Home from "./pages/home";
import ManageAdmins from "./pages/admin/manage";
import AddAdminPage from "./pages/admin/add";
import EditAdminPage from "./pages/admin/edit";
import AssignCourse from "./pages/course/assign";
import CourseList from "./pages/overallhistory/CourseList";
import CourseHistory from "./pages/overallhistory/CourseHistory";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route exact path="/dashboard" element={<ProtectedRoute> <Home /></ProtectedRoute>} />

        {/* -------------------------------------------------------------------------------------------------- */}
        <Route exact path="/manageadmins" element={<ProtectedRoute> <ManageAdmins /> </ProtectedRoute>} />
        <Route exact path="/addadmin" element={<ProtectedRoute> <AddAdminPage /> </ProtectedRoute>} />
        <Route exact path="/editadmin/:id" element={<ProtectedRoute><EditAdminPage /></ProtectedRoute>} />


        {/* -------------------------------------------------------------------------------------------------- */}
        <Route exact path="/createcourse" element={<ProtectedRoute> <CreateCourse /></ProtectedRoute>} />
        <Route exact path="/managecourse" element={<ProtectedRoute> <ManageCourses /></ProtectedRoute>} />
        <Route exact path="/editcourse/:id" element={<ProtectedRoute> <EditCourse /></ProtectedRoute>} />
        <Route exact path="/assigncourse" element={<ProtectedRoute> <AssignCourse /></ProtectedRoute>} />

        {/* -------------------------------------------------------------------------------------------------- */}
        <Route exact path="/managestudent" element={<ProtectedRoute> <ManageStudents /> </ProtectedRoute>} />
        <Route exact path="/addstudent" element={<ProtectedRoute> <AddStudentPage /> </ProtectedRoute>} />
        <Route exact path="/editstudent/:id" element={<ProtectedRoute><EditStudentPage /></ProtectedRoute>} />

        {/* -------------------------------------------------------------------------------------------------- */}
        <Route exact path="/manageteachers" element={<ProtectedRoute> <ManageTeachers /> </ProtectedRoute>} />
        <Route exact path="/addteacher" element={<ProtectedRoute> <AddTeacherPage /> </ProtectedRoute>} />
        <Route exact path="/editteacher/:id" element={<ProtectedRoute><EditTeacherPage /></ProtectedRoute>} />

        {/* New Routes pages you just created */}
        <Route exact path="/courselist" element={<ProtectedRoute> <CourseList /></ProtectedRoute>} />
        <Route exact path="/course-history/:id" element={<ProtectedRoute> <CourseHistory /></ProtectedRoute>} />

      </Routes>
    </AuthProvider>
  );
}

export default App;