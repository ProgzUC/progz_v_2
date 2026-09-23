import React, { useEffect, useState, useMemo } from "react";
import { LuRotateCcw, LuTrash2 } from "react-icons/lu";
import Swal from "sweetalert2";
import { fetchBinItems, restoreBinItem, permanentlyDeleteBinItem } from "../../../api/userApi";
import Loader from "../../../components/common/Loader/Loader";
import PaginationBar from "../../../components/common/PaginationBar/PaginationBar";
import AppSelect from "../../../components/common/AppSelect/AppSelect";
import "./RecycleBin.css";

const AVATAR_TONES = ["green", "blue", "orange", "purple", "teal", "rose"];

const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const toneForName = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i) * (i + 1)) % AVATAR_TONES.length;
  }
  return AVATAR_TONES[hash];
};

const RecycleBin = () => {
  const [binItems, setBinItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const rowsPerPage = 7;

  useEffect(() => {
    loadBinItems();
  }, []);

  const loadBinItems = async () => {
    setLoading(true);
    try {
      const data = await fetchBinItems();
      setBinItems(Array.isArray(data) ? data : data.items || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching bin items:", err);
      setError("Failed to load deleted items.");
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = useMemo(() => {
    const types = new Set();
    binItems.forEach((item) => {
      if (item.itemType) types.add(item.itemType);
    });
    return Array.from(types).sort((a, b) => a.localeCompare(b));
  }, [binItems]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return binItems.filter((item) => {
      const name = (item.itemRefName || item.data?.name || "").toLowerCase();
      const matchesSearch = name.includes(term);
      const matchesType =
        !typeFilter || (item.itemType || "").toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [binItems, searchTerm, typeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter]);

  const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleRestore = (id) => {
    Swal.fire({
      title: "Restore Item?",
      text: "This item will be moved back to its original list.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10A879",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, restore it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await restoreBinItem(id);
          Swal.fire("Restored!", "The item has been restored.", "success");
          loadBinItems();
        } catch (err) {
          Swal.fire("Error!", err.message || "Failed to restore item.", "error");
        }
      }
    });
  };

  const handleDeleteForever = (id) => {
    Swal.fire({
      title: "Permanently Delete?",
      text: "You won't be able to revert this! This item will be gone forever.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it forever!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await permanentlyDeleteBinItem(id);
          Swal.fire("Deleted!", "The item has been permanently deleted.", "success");
          loadBinItems();
        } catch (err) {
          Swal.fire("Error!", err.message || "Failed to delete item.", "error");
        }
      }
    });
  };

  return (
    <div className="admin-recycle-bin-page">
      <header className="page-hero">
        <h1 className="page-title">Recycle bin</h1>
        <p className="page-subtitle">
          Restore deleted items or permanently remove them from the system.
        </p>
      </header>

      <div className="top-row">
        <div className="search-actions">
          <div className="search-box">
            <i className="bi bi-search" aria-hidden="true"></i>
            <input
              type="text"
              placeholder="Search deleted items"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search deleted items"
            />
          </div>

          <div className="type-filter">
            <AppSelect
              icon="bi-funnel"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by type"
              options={[
                { value: "", label: "All types" },
                ...typeOptions.map((type) => ({ value: type, label: type })),
              ]}
            />
            {typeFilter && (
              <button
                type="button"
                className="clear-filter-btn"
                onClick={() => setTypeFilter("")}
                title="Clear filter"
                aria-label="Clear type filter"
              >
                <i className="bi bi-x" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-title-row">
          <h2 className="card-title">Deleted items</h2>
          <span className="card-count">{filteredItems.length} shown</span>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <div className="page-error">
            <p>{error}</p>
            <button type="button" className="retry-btn" onClick={loadBinItems}>
              Retry
            </button>
          </div>
        ) : (
          <>
            <p className="admin-table-scroll-hint">Swipe horizontally to view all columns.</p>
            <div
              className="table-responsive admin-table-wrap"
              tabIndex={0}
              aria-label="Recycle bin table"
            >
              <table className="data-table admin-data-table">
                <caption className="sr-only">Deleted items</caption>
                <thead>
                  <tr>
                    <th scope="col">S.No</th>
                    <th scope="col">Type</th>
                    <th scope="col">Name</th>
                    <th scope="col">Deleted date</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-row">
                        <div className="empty-state">
                          <i className="bi bi-trash" aria-hidden="true"></i>
                          <p>
                            {searchTerm || typeFilter
                              ? "No matching items found."
                              : "Recycle bin is empty."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item, index) => {
                      const name = item.itemRefName || item.data?.name || "N/A";
                      const type = item.itemType || "Unknown";
                      return (
                        <tr key={item._id || item.id}>
                          <td className="col-sno">
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </td>
                          <td>
                            <span className={`type-badge type-${type.toLowerCase()}`}>
                              {type}
                            </span>
                          </td>
                          <td>
                            <div className="person-chip">
                              <span
                                className={`person-avatar tone-${toneForName(name)}`}
                                aria-hidden="true"
                              >
                                {getInitials(name)}
                              </span>
                              <span className="person-name">{name}</span>
                            </div>
                          </td>
                          <td className="col-date">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "—"}
                          </td>
                          <td className="actions-cell">
                            <div className="admin-action-group">
                              <button
                                type="button"
                                className="admin-action-btn admin-action-btn--success"
                                aria-label={`Restore ${name}`}
                                onClick={() => handleRestore(item._id || item.id)}
                              >
                                <LuRotateCcw aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn admin-action-btn--danger"
                                aria-label={`Delete ${name} forever`}
                                onClick={() => handleDeleteForever(item._id || item.id)}
                              >
                                <LuTrash2 aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filteredItems.length > 0 && totalPages > 1 && (
              <PaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="pagination"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecycleBin;
