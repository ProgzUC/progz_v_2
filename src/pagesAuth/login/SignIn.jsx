import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import pattern from "../../assets/login/pattern.png";
import "./Auth.css";
import { login, forgotPassword } from "../../api/authApi";
import { showError, showSuccess } from "../../utils/toast";

const SignIn = () => {
  const navigate = useNavigate();

  // Views: 'login' | 'forgot'
  const [view, setView] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});

  const [forgotEmail, setForgotEmail] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setLoading(true);

    try {
      const data = await login({ email: email.trim(), password }, rememberMe);
      const role = data.role ?? data.user?.role ?? data?.data?.user?.role ?? data?.data?.role;
      const normalizedRole = String(role || "").toLowerCase();

      if (normalizedRole === "admin") {
        showSuccess("Logged in successfully");
        navigate("/admin");
      } else if (normalizedRole === "trainer" || normalizedRole === "instructor") {
        showSuccess("Logged in successfully");
        navigate("/trainer-dashboard");
      } else if (normalizedRole === "student") {
        showSuccess("Logged in successfully");
        navigate("/student-dashboard");
      } else {
        showError("Invalid role");
      }
    } catch (err) {
      showError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
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
      showSuccess(res.msg || `Password reset link has been sent to ${forgotEmail}.`);
      setView("login");
    } catch (err) {
      showError(err.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-layout">
      <div className="auth-container">
        <div className="auth-left">
          {view === "login" && (
            <>
              <p className="welcome">WELCOME BACK 👋</p>
              <h2 className="auth-title">Login</h2>

              <form onSubmit={handleLogin} className="auth-form" noValidate>
                <div className={`auth-input-group ${fieldErrors.email ? "has-error" : ""}`}>
                  <label htmlFor="login-email">Email</label>
                  <div className="input-wrapper">
                    <FiMail className="input-icon" aria-hidden="true" />
                    <input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      autoComplete="username"
                      aria-invalid={fieldErrors.email ? "true" : "false"}
                      aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
                    />
                  </div>
                  {fieldErrors.email && (
                    <span className="field-error" id="login-email-error">
                      {fieldErrors.email}
                    </span>
                  )}
                </div>

                <div className={`auth-input-group ${fieldErrors.password ? "has-error" : ""}`}>
                  <label htmlFor="login-password">Password</label>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" aria-hidden="true" />
                    <input
                      id="login-password"
                      type={showPass ? "text" : "password"}
                      placeholder="Enter your Password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
                      }}
                      autoComplete="current-password"
                      aria-invalid={fieldErrors.password ? "true" : "false"}
                      aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
                    />
                    <button
                      type="button"
                      className="eye-icon"
                      onClick={() => setShowPass(!showPass)}
                      aria-label={showPass ? "Hide password" : "Show password"}
                      aria-pressed={showPass}
                    >
                      {showPass ? <FiEye aria-hidden="true" /> : <FiEyeOff aria-hidden="true" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <span className="field-error" id="login-password-error">
                      {fieldErrors.password}
                    </span>
                  )}
                </div>

                <div className="options-row">
                  <label className="remember">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />{" "}
                    Remember me
                  </label>
                  <button type="button" onClick={() => setView("forgot")} className="forgot forgot-btn">
                    Forgot Password?
                  </button>
                </div>

                <button className="login-btn" type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </button>

                <p className="register-text">
                  <Link to="/signup" className="register-link">
                    Sign up
                  </Link>{" "}
                  for new account
                </p>
              </form>
            </>
          )}

          {view === "forgot" && (
            <>
              <button type="button" className="welcome back-link" onClick={() => setView("login")}>
                ← Back to Login
              </button>
              <h2 className="auth-title">Forgot Password 🔒</h2>
              <p className="auth-subtitle">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleForgotSubmit} className="auth-form" noValidate>
                <div className={`auth-input-group ${fieldErrors.forgotEmail ? "has-error" : ""}`}>
                  <label htmlFor="forgot-email">Enter your Email</label>
                  <div className="input-wrapper">
                    <FiMail className="input-icon" aria-hidden="true" />
                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="e.g. jane@example.com"
                      value={forgotEmail}
                      name="email"
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        if (fieldErrors.forgotEmail) {
                          setFieldErrors((prev) => ({ ...prev, forgotEmail: "" }));
                        }
                      }}
                      aria-invalid={fieldErrors.forgotEmail ? "true" : "false"}
                      aria-describedby={fieldErrors.forgotEmail ? "forgot-email-error" : undefined}
                    />
                  </div>
                  {fieldErrors.forgotEmail && (
                    <span className="field-error" id="forgot-email-error">
                      {fieldErrors.forgotEmail}
                    </span>
                  )}
                </div>
                <button className="login-btn" type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="auth-right">
          <img src={pattern} alt="pattern" className="pattern" />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
