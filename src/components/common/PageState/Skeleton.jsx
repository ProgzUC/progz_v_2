import "./PageState.css";

export default function Skeleton({ variant = "page", rows = 5, label = "Loading" }) {
    if (variant === "cards") {
        return (
            <div className="page-skeleton" role="status" aria-label={label}>
                <div className="skel-cards">
                    {Array.from({ length: 4 }, (_, index) => (
                        <span key={index} className="skel skel-card" />
                    ))}
                </div>
            </div>
        );
    }

    if (variant === "table") {
        return (
            <div className="page-skeleton" role="status" aria-label={label}>
                <div className="skel-table">
                    {Array.from({ length: rows }, (_, index) => (
                        <span key={index} className="skel skel-row" />
                    ))}
                </div>
            </div>
        );
    }

    if (variant === "stats") {
        return (
            <div className="page-skeleton" role="status" aria-label={label}>
                <div className="skel-stats">
                    {Array.from({ length: 4 }, (_, index) => (
                        <span key={index} className="skel skel-stat" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="page-skeleton is-page" role="status" aria-label={label}>
            <span className="skel skel-title" />
            <span className="skel skel-line short" />
            <div className="skel-stats">
                {Array.from({ length: 4 }, (_, index) => (
                    <span key={index} className="skel skel-stat" />
                ))}
            </div>
            <span className="skel skel-line" />
            <span className="skel skel-line" />
        </div>
    );
}
