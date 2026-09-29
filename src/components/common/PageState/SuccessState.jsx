import "./PageState.css";

export default function SuccessState({
    title = "Done",
    message,
    actionLabel,
    onAction,
    onDismiss,
}) {
    return (
        <div className="page-state is-success" role="status">
            <span className="page-state-icon" aria-hidden="true">
                <i className="bi bi-check2-circle" />
            </span>
            <h2>{title}</h2>
            {message ? <p>{message}</p> : null}
            {(onAction || onDismiss) && (
                <div className="page-state-actions">
                    {onAction && actionLabel ? (
                        <button type="button" className="page-state-btn is-primary" onClick={onAction}>
                            {actionLabel}
                        </button>
                    ) : null}
                    {onDismiss ? (
                        <button type="button" className="page-state-btn is-ghost" onClick={onDismiss}>
                            Dismiss
                        </button>
                    ) : null}
                </div>
            )}
        </div>
    );
}
