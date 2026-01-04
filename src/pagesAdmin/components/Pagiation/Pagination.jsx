import React from "react";
import "./Pagination.css";

const Pagination = ({ page, totalPages, onChange }) => {
  return (
    <div className="pagination">
      <button disabled={page === 1} onClick={() => onChange(page - 1)}>
        Prev
      </button>

      <span>{page} / {totalPages}</span>

      <button disabled={page === totalPages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  );
};

export default Pagination;
