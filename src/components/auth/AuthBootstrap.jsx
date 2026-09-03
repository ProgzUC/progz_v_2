import { useEffect, useState } from "react";
import { getMe } from "../../api/authApi";
import { getAuthData, saveAuthSession, clearAuthSession } from "../../utils/authStorage";
import Loader from "../common/Loader/Loader";

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
        } else {
          clearAuthSession();
        }
      } catch {
        clearAuthSession();
      }

      if (!cancelled) setReady(true);
    };

    bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return <Loader />;

  return children;
};

export default AuthBootstrap;
