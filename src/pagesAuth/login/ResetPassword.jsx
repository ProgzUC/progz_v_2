import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import pattern from "../../assets/login/pattern.png";
import "./Auth.css";
import { resetPassword } from "../../api/authApi";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    // Reset Password State
    const [resetData, setResetData] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const [showResetPass, setShowResetPass] = useState({
        new: false,
        confirm: false,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const resetFields = [
        {
            id: "newPassword",
            label: "New Password",
            type: showResetPass.new ? "text" : "password",
            placeholder: "Enter new password",
            value: resetData.newPassword,
            name: "newPassword",
            icon: <FiLock />,
            isPassword: true,
            showPass: showResetPass.new,
            togglePass: () => setShowResetPass((prev) => ({ ...prev, new: !prev.new })),
        },
        {
            id: "confirmPassword",
            label: "Confirm Password",
            type: showResetPass.confirm ? "text" : "password",
            placeholder: "Confirm new password",
            value: resetData.confirmPassword,
            name: "confirmPassword",
            icon: <FiLock />,
            isPassword: true,
            showPass: showResetPass.confirm,
            togglePass: () => setShowResetPass((prev) => ({ ...prev, confirm: !prev.confirm })),
        },
    ];

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (resetData.newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (resetData.newPassword !== resetData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const res = await resetPassword({ password: resetData.newPassword }, token);
            setSuccessMessage(res.msg || "Password reset successfully! You can now login.");
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    const handleResetDataChange = (field, value) => {
        setResetData((prev) => ({ ...prev, [field]: value }));
    };

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
                        onChange={(e) =>
                            handleChange
                                ? handleChange(field.name, e.target.value)
                                : field.setValue(e.target.value)
                        }
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

    const SuccessPopup = ({ msg, actionName, onAction }) => (
        <div className="auth-popup-overlay">
            <div className="auth-popup">
                <div className="popup-icon">✅</div>
                <h3>Success</h3>
                <p>{msg}</p>
                <button
                    onClick={() => {
                        setSuccessMessage("");
                        if (onAction) onAction();
                    }}
                    className="login-btn popup-btn"
                >
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
                    actionName="Back to Login"
                    onAction={() => navigate("/")}
                />
            )}

            {/* LEFT PANEL */}
            <div className="auth-left">
                <h2 className="auth-title">Reset Password 🔑</h2>
                <p className="auth-subtitle">Enter your new password below.</p>
                {error && <p className="auth-error">{error}</p>}

                <form onSubmit={handleResetSubmit} className="auth-form">
                    {renderInputs(resetFields, handleResetDataChange)}
                    <button className="login-btn" type="submit" disabled={loading}>
                        {loading ? "Updating..." : "Set New Password"}
                    </button>
                </form>
            </div>

            {/* RIGHT PANEL */}
            <div className="auth-right">
                <img src={pattern} alt="pattern" className="pattern" />
            </div>
        </div>
    );
};

export default ResetPassword;
