import "./PageState.css";

export default function ErrorState({
    title = "Something went wrong",
    message = "We could not load this. Check your connection and try again.",
    onRetry,
    onBack,
    backLabel = "Go back",
    compact = false,
}) {
    return (
        <div className={`page-state is-error${compact ? " is-compact" : ""}`} role="alert">
            <span className="page-state-icon" aria-hidden="true">
                <i className="bi bi-exclamation-triangle" />
            </span>
            <h2>{title}</h2>
            {message ? <p>{message}</p> : null}
            {(onRetry || onBack) && (
                <div className="page-state-actions">
                    {onRetry ? (
                        <button type="button" className="page-state-btn is-primary" onClick={onRetry}>
                            Try again
                        </button>
                    ) : null}
                    {onBack ? (
                        <button type="button" className="page-state-btn is-ghost" onClick={onBack}>
                            {backLabel}
                        </button>
                    ) : null}
                </div>
            )}
        </div>
    );
}
