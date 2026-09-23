import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import pattern from "../../assets/login/pattern.png";
import "./Auth.css";
import { verifyMagicLogin } from "../../api/authApi";

const MagicLogin = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!token) {
        setStatus("error");
        setError("Missing login token.");
        return;
      }

      try {
        const data = await verifyMagicLogin(token, true);
        if (cancelled) return;

        setStatus("success");
        const role = String(data.role ?? data.user?.role ?? "").toLowerCase();

        setTimeout(() => {
          if (role === "admin") navigate("/admin", { replace: true });
          else if (role === "trainer" || role === "instructor") {
            navigate("/trainer-dashboard", { replace: true });
          } else {
            navigate("/student-dashboard", { replace: true });
          }
        }, 600);
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setError(err.message || "This login link is invalid or has expired.");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  return (
    <div className="auth-page-layout">
      <div className="auth-container">
        <div className="auth-left">
          <p className="welcome">PROGZ</p>
          <h2 className="auth-title">
            {status === "loading" && "Signing you in…"}
            {status === "success" && "You're in!"}
            {status === "error" && "Link expired"}
          </h2>

          {status === "loading" && (
            <p className="auth-subtitle">Verifying your secure login link. Please wait.</p>
          )}

          {status === "success" && (
            <p className="auth-subtitle">Redirecting you to your dashboard…</p>
          )}

          {status === "error" && (
            <>
              <div className="admin-live-region" role="alert" aria-live="polite">
                <p className="auth-error">{error}</p>
              </div>
              <p className="auth-subtitle">
                Request a new passwordless login link from the login page using your registered email.
              </p>
              <Link to="/login" className="login-btn" style={{ display: "inline-block", textAlign: "center" }}>
                Back to Login
              </Link>
            </>
          )}
        </div>
        <div className="auth-right">
          <img src={pattern} alt="" className="pattern" />
        </div>
      </div>
    </div>
  );
};

export default MagicLogin;
