
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import pattern from "../../assets/login/pattern.png";
import "./Auth.css";
import { login, forgotPassword } from "../../api/authApi";

const SignIn = () => {
  const navigate = useNavigate();

  // ================= STATE =================
  // Views: 'login' | 'forgot'
  const [view, setView] = useState("login");

  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});

  // Forgot Password State  
  const [forgotEmail, setForgotEmail] = useState("");

  // General State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // For popups

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateLogin = () => {
    const next = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      next.email = "Email is required";
    } else if (!emailRegex.test(trimmedEmail)) {
      next.email = "Please enter a valid email address";
    }

    if (!password) {
      next.password = "Password is required";
    } else if (password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  // ================= HANDLERS =================

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateLogin()) return;

    setLoading(true);

    try {
      const data = await login({ email: email.trim(), password }, rememberMe);
      const role = data.role ?? data.user?.role;

      if (role === "admin") navigate("/admin");
      else if (role === "trainer") navigate("/trainer-dashboard");
      else if (role === "student") navigate("/student-dashboard");
      else setError("Invalid role");

    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setFieldErrors({});

    if (!forgotEmail.trim()) {
      setFieldErrors({ forgotEmail: "Email is required" });
      return;
    }
    if (!emailRegex.test(forgotEmail.trim())) {
      setFieldErrors({ forgotEmail: "Please enter a valid email address" });
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword({ email: forgotEmail });
      setSuccessMessage(res.msg || `Password reset link has been sent to ${forgotEmail}.`);
    } catch (err) {
      setError(err.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };



  // Popup Component
  const SuccessPopup = ({ msg, actionName, onAction }) => (
    <div className="auth-popup-overlay">
      <div className="auth-popup">
        <div className="popup-icon">✅</div>
        <h3>Success</h3>
        <p>{msg}</p>
        <button onClick={() => {
          setSuccessMessage("")
          if (onAction) onAction();
        }} className="login-btn popup-btn">
          {actionName || "Close"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="auth-container">
      {/* SUCCESS POPUP */}
      {successMessage && (
        <SuccessPopup
          msg={successMessage}
          actionName={"Back to Login"}
          onAction={() => {
            if (view === "forgot") {
              // Simulate clicking email link -> go into reset route
              navigate("/");
            }
          }}
        />
      )}

      {/* LEFT PANEL */}
      <div className="auth-left">

        {/* VIEW: LOGIN */}
        {view === "login" && (
          <>
            <p className="welcome">WELCOME BACK 👋</p>
            <h2 className="auth-title">Login</h2>
            {error && <p className="auth-error">{error}</p>}

            <form onSubmit={handleLogin} className="auth-form" noValidate>
              <div className={`auth-input-group ${fieldErrors.email ? "has-error" : ""}`}>
                <label>Email</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    autoComplete="username"
                  />
                </div>
                {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
              </div>

              <div className={`auth-input-group ${fieldErrors.password ? "has-error" : ""}`}>
                <label>Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Enter your Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    autoComplete="current-password"
                  />
                  <div className="eye-icon" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <FiEye /> : <FiEyeOff />}
                  </div>
                </div>
                {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
              </div>

              <div className="options-row">
                <label className="remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  /> Remember me
                </label>
                <span onClick={() => setView("forgot")} className="forgot" style={{ cursor: 'pointer' }}>
                  Forgot Password?
                </span>
              </div>

              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="register-text">
                <Link to="/signup" className="register-link">Sign up</Link> for new account
              </p>

              {/* <div className="social-section">
                <p className="or-text">or continue with</p>
                <div className="social-row">
                  <FaFacebook className="social-icon facebook" />
                  <FaApple className="social-icon apple" />
                  <FcGoogle className="social-icon google" />
                </div>
              </div> */}
            </form>
          </>
        )}

        {/* VIEW: FORGOT PASSWORD */}
        {view === "forgot" && (
          <>
            <p className="welcome" onClick={() => setView("login")} style={{ cursor: "pointer" }}>← Back to Login</p>
            <h2 className="auth-title">Forgot Password 🔒</h2>
            <p className="auth-subtitle">Enter your email and we'll send you a link to reset your password.</p>
            {error && <p className="auth-error">{error}</p>}

            <form onSubmit={handleForgotSubmit} className="auth-form" noValidate>
              <div className={`auth-input-group ${fieldErrors.forgotEmail ? "has-error" : ""}`}>
                <label>Enter your Email</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    placeholder="e.g. jane@example.com"
                    value={forgotEmail}
                    name="email"
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      if (fieldErrors.forgotEmail) setFieldErrors((prev) => ({ ...prev, forgotEmail: "" }));
                    }}
                  />
                </div>
                {fieldErrors.forgotEmail && <span className="field-error">{fieldErrors.forgotEmail}</span>}
              </div>
              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}



      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <img src={pattern} alt="pattern" className="pattern" />
      </div>

    </div>
  );
};

export default SignIn;
