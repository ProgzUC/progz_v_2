import { Navigate } from "react-router-dom";
import { getAuthData } from "../../utils/authStorage";

const roleHome = (role) => {
  const normalized = String(role || "").toLowerCase();
  if (normalized === "admin") return "/admin";
  if (normalized === "trainer" || normalized === "instructor") return "/trainer-dashboard/";
  if (normalized === "student") return "/student-dashboard/";
  return "/login";
};

const GuestOnlyRoute = ({ children }) => {
  const { user, isAuthenticated } = getAuthData();

  if (isAuthenticated && user?.role) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return children;
};

export default GuestOnlyRoute;
