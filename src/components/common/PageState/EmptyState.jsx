import "./PageState.css";

export default function EmptyState({
    title = "Nothing here yet",
    message = "When there is something to show, it will appear here.",
    actionLabel,
    onAction,
    icon = "bi-inbox",
}) {
    return (
        <div className="page-state" role="status">
            <span className="page-state-icon" aria-hidden="true">
                <i className={`bi ${icon}`} />
            </span>
            <h2>{title}</h2>
            {message ? <p>{message}</p> : null}
            {actionLabel && onAction ? (
                <div className="page-state-actions">
                    <button type="button" className="page-state-btn is-primary" onClick={onAction}>
                        {actionLabel}
                    </button>
                </div>
            ) : null}
        </div>
    );
}
