import { useEffect, useState } from "react";
import { getMe } from "../../api/authApi";
import { getAuthData, saveAuthSession, clearAuthSession } from "../../utils/authStorage";
import Loader from "../common/Loader/Loader";

const roleHome = {
  admin: "/admin",
  trainer: "/trainer-dashboard",
  student: "/student-dashboard",
};

const redirectForRole = (role) => {
  const normalizedRole = String(role || "").trim().toLowerCase();
  const destination = roleHome[normalizedRole === "instructor" ? "trainer" : normalizedRole];
  if (!destination || window.location.pathname.startsWith(destination)) return;
  window.location.replace(destination);
};

const AuthBootstrap = ({ children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const bootstrapSession = async () => {
      const { user } = getAuthData();

      if (!user) {
        if (!cancelled) setReady(true);
        return;
      }

      const rememberMe = !!localStorage.getItem("user");

      try {
        const meData = await getMe();
        if (meData?.user) {
          saveAuthSession({ user: meData.user, rememberMe });
          redirectForRole(meData.user.role);
        } else {
          clearAuthSession();
        }
      } catch {
        clearAuthSession();
      }

      if (!cancelled) setReady(true);
    };

    bootstrapSession();

    const resyncSession = () => {
      if (document.visibilityState === "visible" && getAuthData().user) {
        bootstrapSession();
      }
    };

    window.addEventListener("focus", resyncSession);
    document.addEventListener("visibilitychange", resyncSession);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", resyncSession);
      document.removeEventListener("visibilitychange", resyncSession);
    };
  }, []);

  if (!ready) return <Loader />;

  return children;
};

export default AuthBootstrap;
