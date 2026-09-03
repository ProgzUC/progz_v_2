import { Navigate } from "react-router-dom";
import { getAuthData } from "../../utils/authStorage";

const roleHome = {
  admin: "/admin",
  trainer: "/trainer-dashboard",
  student: "/student-dashboard",
};

const GuestOnlyRoute = ({ children }) => {
  const { user, isAuthenticated } = getAuthData();

  if (isAuthenticated && user?.role) {
    const destination = roleHome[user.role] || "/login";
    return <Navigate to={destination} replace />;
  }

  return children;
};

export default GuestOnlyRoute;
