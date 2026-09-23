import React, { useState, useMemo, useEffect } from "react";
import "./Students.css";
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

const Students = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: allUsers = [], isLoading, isError, error } = useAllUsers();
  const { mutate: deleteUser } = useDeleteUser();

  const students = useMemo(
    () => allUsers.filter((user) => user.role === "student"),
    [allUsers]
  );

  const rowsPerPage = 7;

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return students.filter((s) => {
      return (
        (s.name || "").toLowerCase().includes(term) ||
        (s.email || "").toLowerCase().includes(term) ||
        (s.phone || "").includes(search) ||
        String(s.id || s._id || "").toLowerCase().includes(term)
      );
    });
  }, [students, search]);

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
      title: "Delete Student?",
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
              text: "Student has been deleted.",
              icon: "success",
              confirmButtonColor: "#28a745",
              timer: 1500,
            });
          },
          onError: (err) => {
            Swal.fire({
              title: "Error!",
              text: err.message || "Failed to delete student.",
              icon: "error",
              confirmButtonColor: "#d33",
            });
          },
        });
      }
    });
  };

  return (
    <div className="admin-students-page">
      <header className="page-hero">
        <h1 className="page-title">Student management</h1>
        <p className="page-subtitle">
          Add students, update profiles and track who is enrolled in your courses.
        </p>
      </header>

      <div className="top-row">
        <div className="search-actions">
          <div className="search-box">
            <i className="bi bi-search" aria-hidden="true"></i>
            <input
              type="text"
              placeholder="Search students"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search students"
            />
          </div>

          <button
            type="button"
            className="create-btn"
            onClick={() => navigate("/admin/bulk-import")}
            style={{ marginRight: 8 }}
          >
            Bulk Import
          </button>
          <button
            type="button"
            className="create-btn"
            onClick={() => navigate("/admin/add-student")}
          >
            + Add student
          </button>
        </div>
      </div>

      <div className="content-card">
        <div className="card-title-row">
          <h2 className="card-title">All students</h2>
          <span className="card-count">{filtered.length} shown</span>
        </div>

        {isLoading ? (
          <Loader />
        ) : isError ? (
          <div className="page-error">
            Error loading students: {error?.message || "Something went wrong"}
          </div>
        ) : (
          <>
            <p className="admin-table-scroll-hint">Swipe horizontally to view all columns.</p>
            <div className="table-responsive admin-table-wrap" tabIndex={0} aria-label="Students table">
              <table className="data-table admin-data-table">
                <caption className="sr-only">All students</caption>
                <thead>
                  <tr>
                    <th scope="col">S.No</th>
                    <th scope="col">Student</th>
                    <th scope="col">E-mail</th>
                    <th scope="col">Mobile No</th>
                    <th scope="col">Qualification</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((s, index) => {
                      const name = s.name || "Student";
                      const studentId = s.id || s._id || "—";
                      return (
                        <tr key={s._id || s.id || index}>
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
                              <div className="person-meta">
                                <span className="person-name">{name}</span>
                                <span className="person-id">ID: {studentId}</span>
                              </div>
                            </div>
                          </td>
                          <td>{s.email || "—"}</td>
                          <td>{s.phone || "—"}</td>
                          <td>
                            <div className="qual-cell">
                              {(s.education || s.qualification || "Not specified")
                                .split("\n")
                                .map((line, i) => (
                                  <div key={i}>{line}</div>
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
                                  navigate("/admin/student-preview", {
                                    state: { student: s, initialEditMode: false },
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
                                  navigate("/admin/student-preview", {
                                    state: { student: s, initialEditMode: true },
                                  })
                                }
                              >
                                <LuPencil aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn admin-action-btn--danger"
                                aria-label={`Delete ${name}`}
                                onClick={() => handleDelete(s)}
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
                        No students found.
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

export default Students;
