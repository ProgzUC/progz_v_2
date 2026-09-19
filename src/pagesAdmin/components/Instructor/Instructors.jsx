import React, { useState, useMemo, useEffect } from "react";
import "./Instructors.css";
import Loader from "../../../components/common/Loader/Loader";
import PaginationBar from "../../../components/common/PaginationBar/PaginationBar";
import { useAllUsers, useDeleteUser } from "../../../hooks/useAdminUsers";
import { LuEye, LuPencil, LuTrash2 } from "react-icons/lu";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const AVATAR_TONES = ["green", "blue", "orange", "purple", "teal", "rose"];

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
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

const Instructors = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: allUsers = [], isLoading, isError, error } = useAllUsers();
  const { mutate: deleteUser } = useDeleteUser();

  const instructors = useMemo(
    () => allUsers.filter((user) => user.role === "trainer" || user.role === "instructor"),
    [allUsers]
  );

  const rowsPerPage = 7;

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return instructors.filter((i) => {
      return (
        (i.name || "").toLowerCase().includes(term) ||
        (i.email || "").toLowerCase().includes(term) ||
        (i.phone || "").includes(search)
      );
    });
  }, [instructors, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginatedData = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleDelete = (user) => {
    Swal.fire({
      title: "Delete Instructor?",
      text: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
      background: "#fff",
      color: "#333",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser(user._id || user.id, {
          onSuccess: () => {
            Swal.fire({
              title: "Deleted!",
              text: "Instructor has been deleted.",
              icon: "success",
              confirmButtonColor: "#28a745",
              timer: 1500,
            });
          },
          onError: (err) => {
            Swal.fire({
              title: "Error!",
              text: err.message || "Failed to delete instructor.",
              icon: "error",
              confirmButtonColor: "#d33",
            });
          },
        });
      }
    });
  };

  return (
    <div className="admin-instructors-page">
      <header className="page-hero">
        <h1 className="page-title">Instructor management</h1>
        <p className="page-subtitle">
          Add instructors, update profiles and manage who teaches your courses.
        </p>
      </header>

      <div className="top-row">
        <div className="search-actions">
          <div className="search-box">
            <i className="bi bi-search" aria-hidden="true"></i>
            <input
              type="text"
              placeholder="Search instructors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search instructors"
            />
          </div>

          <button
            type="button"
            className="create-btn"
            onClick={() => navigate("/admin/add-instructor")}
          >
            + Add instructor
          </button>
        </div>
      </div>

      <div className="content-card">
        <div className="card-title-row">
          <h2 className="card-title">All instructors</h2>
          <span className="card-count">{filtered.length} shown</span>
        </div>

        {isLoading ? (
          <Loader />
        ) : isError ? (
          <div className="page-error">
            Error loading instructors: {error?.message || "Something went wrong"}
          </div>
        ) : (
          <>
            <p className="admin-table-scroll-hint">Swipe horizontally to view all columns.</p>
            <div className="table-responsive admin-table-wrap" tabIndex={0} aria-label="Instructors table">
              <table className="data-table admin-data-table">
                <caption className="sr-only">All instructors</caption>
                <thead>
                  <tr>
                    <th scope="col">S.No</th>
                    <th scope="col">Instructor</th>
                    <th scope="col">E-mail</th>
                    <th scope="col">Mobile No</th>
                    <th scope="col">Qualification</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, index) => {
                      const name = item.name || "Instructor";
                      return (
                        <tr key={item._id || item.id || index}>
                          <td className="col-sno">
                            {(currentPage - 1) * rowsPerPage + index + 1}
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
                          <td>{item.email || "—"}</td>
                          <td>{item.phone || "—"}</td>
                          <td>
                            <div className="qual-cell">
                              {(item.education || item.qualification || "Not specified")
                                .split("\n")
                                .map((line, idx) => (
                                  <div key={idx}>{line}</div>
                                ))}
                            </div>
                          </td>
                          <td className="actions-cell">
                            <div className="admin-action-group">
                              <button
                                type="button"
                                className="admin-action-btn"
                                aria-label={`View ${name}`}
                                onClick={() =>
                                  navigate("/admin/instructor-preview", {
                                    state: { instructor: item, initialEditMode: false },
                                  })
                                }
                              >
                                <LuEye aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn"
                                aria-label={`Edit ${name}`}
                                onClick={() =>
                                  navigate("/admin/instructor-preview", {
                                    state: { instructor: item, initialEditMode: true },
                                  })
                                }
                              >
                                <LuPencil aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn admin-action-btn--danger"
                                aria-label={`Delete ${name}`}
                                onClick={() => handleDelete(item)}
                              >
                                <LuTrash2 aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-row">
                        No instructors found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 && totalPages > 1 && (
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

export default Instructors;
