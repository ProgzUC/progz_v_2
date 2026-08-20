//package imports
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import "./App.css"
//importing componenents
import SignIn from "./pagesAuth/login/SignIn"
import StudentSignup from "./pagesAuth/signup/StudentSignup"
import ResetPassword from "./pagesAuth/login/ResetPassword"
import TrainerApp from "./pagesTrainer/TrainerApp"
import StudentApp from "./pagesStudent/StudentApp"
import AdminApp from "./pagesAdmin/AdminApp"
import PrivacyPolicy from "./pagesAuth/Privacy"
import { getAuthData } from "./utils/authStorage"


const CompilerRedirect = () => {
  const location = useLocation();
  return <Navigate to={`/student-dashboard/compiler${location.search}`} replace />;
};

const Unauthorized = () => (
  <div className="unauthorized-page-layout">
    <div style={{ padding: "40px", textAlign: "center", fontFamily: "var(--font-family-base)", flex: 1 }}>
      <h2>Access Denied</h2>
      <p>You do not have permission to view this page.</p>
      <a href="/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Go to Login</a>
    </div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = getAuthData();

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const normalizedAllowed = allowedRoles.map((r) => String(r).toLowerCase());
  const userRole = String(user.role || "").toLowerCase();

  if (!normalizedAllowed.includes(userRole))
    return <Navigate to="/unauthorized" replace />;

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
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/compiler" element={<CompilerRedirect />} />
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