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


const parseStoredUser = (storage) => {
  try {
    const raw = storage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    storage.removeItem("user");
    return null;
  }
};

const getAuthData = () => {
  const localToken = localStorage.getItem("accessToken");
  const sessionToken = sessionStorage.getItem("accessToken");
  const localUser = parseStoredUser(localStorage);
  const sessionUser = parseStoredUser(sessionStorage);

  if (sessionToken && sessionUser) {
    return { token: sessionToken, user: sessionUser };
  }
  if (localToken && localUser) {
    return { token: localToken, user: localUser };
  }

  const token = localToken || sessionToken;
  const user = localUser || sessionUser;
  return { token, user };
};

const Unauthorized = () => (
  <div style={{ padding: "40px", textAlign: "center", fontFamily: "Inter, sans-serif" }}>
    <h2>Access Denied</h2>
    <p>You do not have permission to view this page.</p>
    <a href="/login" style={{ color: "#198754", fontWeight: 600 }}>Go to Login</a>
  </div>
);

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
          <Route path="/unauthorized" element={<Unauthorized />} />

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