//package imports
import { BrowserRouter, Routes, Route } from "react-router-dom"
import "./App.css"
//importing componenents
import SignIn from "./pagesAuth/login/SignIn"
import StudentSignup from "./pagesAuth/signup/StudentSignup"
import ResetPassword from "./pagesAuth/login/ResetPassword"
import { Navigate } from "react-router-dom"
import TrainerApp from "./pagesTrainer/TrainerApp"
import StudentApp from "./pagesStudent/StudentApp"
import AdminApp from "./pagesAdmin/AdminApp"
import PrivacyPolicy from "./pagesAuth/Privacy"


const getAuthData = () => {
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  const user =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(sessionStorage.getItem("user"));

  return { token, user };
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = getAuthData();

  if (!token || !user) return <Navigate to="/login" />;

  if (!allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" />;

  return children;
};

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>

          {/* Login Routes */}
          <Route path="/" element={<SignIn />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<StudentSignup />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          {/* End of Login Routes */}

          {/* Protected Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminApp />
              </ProtectedRoute>
            }
          />



          <Route
            path="/trainer-dashboard"
            element={
              <ProtectedRoute allowedRoles={["trainer"]}>
                <TrainerApp />
              </ProtectedRoute>
            }
          />


          <Route
            path="/student-dashboard/*"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentApp />
              </ProtectedRoute>
            }
          />
          {/* End of Protected Routes */}

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;