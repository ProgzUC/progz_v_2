import React from "react";

export default function TrainerStatus({ message, onRetry, onBack, backLabel = "Go back" }) {
    return (
        <div className="trainer-status" role="alert">
            <p>{message || "Something went wrong."}</p>
            <div className="trainer-status-actions">
                {onRetry && (
                    <button type="button" className="trainer-btn-primary" onClick={onRetry}>
                        Try again
                    </button>
                )}
                {onBack && (
                    <button type="button" className="trainer-btn-secondary" onClick={onBack}>
                        {backLabel}
                    </button>
                )}
            </div>
        </div>
    );
}
