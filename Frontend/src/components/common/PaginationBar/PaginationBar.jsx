import React from "react";
import { getVisiblePages } from "../../../utils/pagination";
import "./PaginationBar.css";

const PaginationBar = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "pagination",
  arrowClassName = "page-arrow",
  buttonClassName = "page-btn",
}) => {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages);

  const pageButtonClass = (page) =>
    [buttonClassName, currentPage === page ? "active" : ""].filter(Boolean).join(" ");

  return (
    <div className={className}>
      <button
        type="button"
        className={arrowClassName || undefined}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        &lt;
      </button>

      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="page-ellipsis" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            className={pageButtonClass(page) || undefined}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        className={arrowClassName || undefined}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        &gt;
      </button>
    </div>
  );
};

export default PaginationBar;
