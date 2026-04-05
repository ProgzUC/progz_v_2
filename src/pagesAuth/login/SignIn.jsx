
import { useNavigate } from "react-router-dom";
import { act, useState } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FaFacebook, FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
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

  // Forgot Password State  
  const [forgotEmail, setForgotEmail] = useState("");



  // General State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // For popups

  // ================= CONFIG ARRAYS =================

  const forgotFields = [
    {
      id: "forgotEmail",
      label: "Enter your Email",
      type: "email",
      placeholder: "e.g. jane@example.com",
      value: forgotEmail,
      setValue: setForgotEmail,
      icon: <FiMail />,
      name: "email"
    }
  ];



  // ================= HANDLERS =================

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login({ email, password }, rememberMe);
      const role = data.role;

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

    // Basic Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      setError("Please enter a valid email address.");
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



  // ================= RENDER HELPERS =================

  // Generic Input Renderer
  const renderInputs = (fields, handleChange) => {
    return fields.map((field) => (
      <div className="auth-input-group" key={field.id}>
        <label>{field.label}</label>
        <div className="input-wrapper">
          <span className="input-icon-wrapper">{field.icon}</span>
          <input
            type={field.type}
            placeholder={field.placeholder}
            value={field.value}
            name={field.name}
            onChange={(e) => handleChange ? handleChange(field.name, e.target.value) : field.setValue(e.target.value)}
          />
          {field.isPassword && (
            <div className="eye-icon" onClick={field.togglePass}>
              {field.showPass ? <FiEye /> : <FiEyeOff />}
            </div>
          )}
        </div>
      </div>
    ));
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

            <form onSubmit={handleLogin} className="auth-form">
              <div className="auth-input-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Enter your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <div className="eye-icon" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <FiEye /> : <FiEyeOff />}
                  </div>
                </div>
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

            <form onSubmit={handleForgotSubmit} className="auth-form">
              {renderInputs(forgotFields)}
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
