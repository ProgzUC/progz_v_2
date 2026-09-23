import React, { useState, useMemo, useEffect } from "react";
import { LuEye, LuCheck, LuX } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { usePendingUsers, useApproveUser, useRejectUser } from "../../../hooks/useAdminUsers";
import { approveUser, rejectUser } from "../../../api/userApi";
import Loader from "../../../components/common/Loader/Loader";
import PaginationBar from "../../../components/common/PaginationBar/PaginationBar";
import Swal from "sweetalert2";
import "./ApproveUser.css";

const AVATAR_TONES = ["green", "blue", "orange", "purple", "teal", "rose"];

const getUserId = (user) => user._id || user.id;

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

const ApproveUser = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: pendingUsers = [], isLoading, isError, error } = usePendingUsers();
  const [activeTab, setActiveTab] = useState("student");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const rowsPerPage = 7;

  const filteredUsers = useMemo(() => {
    return pendingUsers.filter((user) => {
      const role = (user.role || "").toLowerCase();
      const matchesTab =
        activeTab === "student"
          ? role === "student"
          : role === "trainer" || role === "instructor";
      const matchesSearch =
        (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.source || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.zenCourseName || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [pendingUsers, activeTab, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [searchTerm, activeTab]);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedData = filteredUsers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedIds(new Set());
    }
  };

  const pageIds = paginatedData.map(getUserId);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const somePageSelected = pageIds.some((id) => selectedIds.has(id));

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const runBulkAction = async (action) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    const isApprove = action === "approve";
    const result = await Swal.fire({
      title: isApprove ? "Approve selected users?" : "Reject selected users?",
      text: `${ids.length} ${activeTab}(s) will be ${isApprove ? "approved" : "rejected"}.`,
      icon: isApprove ? "question" : "warning",
      showCancelButton: true,
      confirmButtonColor: isApprove ? "#10A879" : "#d33",
      cancelButtonColor: "#718096",
      confirmButtonText: isApprove ? "Yes, approve all" : "Yes, reject all",
    });

    if (!result.isConfirmed) return;

    setIsBulkProcessing(true);
    const outcomes = await Promise.allSettled(
      ids.map((id) => (isApprove ? approveUser(id) : rejectUser(id)))
    );

    const successCount = outcomes.filter((o) => o.status === "fulfilled").length;
    const failCount = outcomes.length - successCount;

    await queryClient.invalidateQueries({ queryKey: ["pendingUsers"] });
    if (isApprove) {
      await queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    }

    setSelectedIds(new Set());
    setIsBulkProcessing(false);

    if (failCount === 0) {
      Swal.fire(
        isApprove ? "Approved!" : "Rejected!",
        `${successCount} user(s) ${isApprove ? "approved" : "rejected"} successfully.`,
        "success"
      );
    } else {
      Swal.fire(
        "Partially completed",
        `${successCount} succeeded, ${failCount} failed.`,
        successCount > 0 ? "warning" : "error"
      );
    }
  };

  const { mutate: approve } = useApproveUser();
  const { mutate: reject } = useRejectUser();

  const handleView = (user) => {
    navigate("/admin/user-detail-view", { state: { user } });
  };

  const handleApprove = (user) => {
    Swal.fire({
      title: "Approve User?",
      text: `Are you sure you want to approve ${user.name}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10A879",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, approve!",
    }).then((result) => {
      if (result.isConfirmed) {
        approve(user._id || user.id);
        Swal.fire("Approved!", "User has been approved.", "success");
      }
    });
  };

  const handleReject = (user) => {
    Swal.fire({
      title: "Reject User?",
      text: `Are you sure you want to reject ${user.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, reject!",
    }).then((result) => {
      if (result.isConfirmed) {
        reject(user._id || user.id);
        Swal.fire("Rejected!", "User has been rejected.", "success");
      }
    });
  };

  const colSpan = activeTab === "student" ? 7 : 6;

  return (
    <div className="admin-approve-user-page">
      <header className="page-hero">
        <h1 className="page-title">Approve users</h1>
        <p className="page-subtitle">
          Review pending registrations and approve or reject students and trainers.
        </p>
      </header>

      <div className="top-row">
        <div className="search-actions">
          <div className="search-box">
            <i className="bi bi-search" aria-hidden="true"></i>
            <input
              type="text"
              placeholder={`Search ${activeTab}s`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label={`Search ${activeTab}s`}
            />
          </div>

          <div className="tab-pills" role="tablist" aria-label="User type">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "student"}
              className={`tab-pill ${activeTab === "student" ? "active" : ""}`}
              onClick={() => setActiveTab("student")}
            >
              Students
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "trainer"}
              className={`tab-pill ${activeTab === "trainer" ? "active" : ""}`}
              onClick={() => setActiveTab("trainer")}
            >
              Trainers
            </button>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-title-row">
          <h2 className="card-title">Pending registrations</h2>
          <span className="card-count">{filteredUsers.length} shown</span>
        </div>

        {isLoading ? (
          <Loader />
        ) : isError ? (
          <div className="page-error">
            Error loading users: {error?.message || "Something went wrong"}
          </div>
        ) : (
          <>
            {selectedIds.size > 0 && (
              <div className="bulk-actions-bar">
                <span className="bulk-selection-count">{selectedIds.size} selected</span>
                <div className="bulk-actions-buttons">
                  <button
                    type="button"
                    className="bulk-btn bulk-approve-btn"
                    disabled={isBulkProcessing}
                    onClick={() => runBulkAction("approve")}
                  >
                    Approve selected
                  </button>
                  <button
                    type="button"
                    className="bulk-btn bulk-reject-btn"
                    disabled={isBulkProcessing}
                    onClick={() => runBulkAction("reject")}
                  >
                    Reject selected
                  </button>
                  <button
                    type="button"
                    className="bulk-btn bulk-clear-btn"
                    disabled={isBulkProcessing}
                    onClick={clearSelection}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            <p className="admin-table-scroll-hint">Swipe horizontally to view all columns.</p>
            <div
              className="table-responsive admin-table-wrap"
              tabIndex={0}
              aria-label="Pending registrations table"
            >
              <table className="data-table admin-data-table">
                <caption className="sr-only">Pending {activeTab} registrations</caption>
                <thead>
                  <tr>
                    <th className="select-col" scope="col">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = somePageSelected && !allPageSelected;
                        }}
                        onChange={toggleSelectAllPage}
                        disabled={paginatedData.length === 0 || isBulkProcessing}
                        aria-label="Select all on this page"
                      />
                    </th>
                    <th scope="col">S.No</th>
                    <th scope="col">Name</th>
                    <th scope="col">Source</th>
                    {activeTab === "student" && <th scope="col">Zen Course</th>}
                    <th scope="col">Requested</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={colSpan} className="empty-row">
                        No pending {activeTab}s found.
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((user, index) => {
                      const userId = getUserId(user);
                      const isSelected = selectedIds.has(userId);
                      const name = user.name || "User";

                      return (
                        <tr key={userId} className={isSelected ? "row-selected" : ""}>
                          <td className="select-col">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(userId)}
                              disabled={isBulkProcessing}
                              aria-label={`Select ${name}`}
                            />
                          </td>
                          <td className="col-sno">
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </td>
                          <td>
                            <div
                              className="person-chip person-chip--selectable"
                              onDoubleClick={() => {
                                if (!isBulkProcessing) toggleSelect(userId);
                              }}
                              title="Double-click name to select"
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (isBulkProcessing) return;
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  toggleSelect(userId);
                                }
                              }}
                            >
                              <span
                                className={`person-avatar tone-${toneForName(name)}`}
                                aria-hidden="true"
                              >
                                {getInitials(name)}
                              </span>
                              <span className="person-name">{name}</span>
                            </div>
                          </td>
                          <td>{user.source || "—"}</td>
                          {activeTab === "student" && (
                            <td>{user.zenCourseName || "—"}</td>
                          )}
                          <td className="col-date">
                            {new Date(user.date || user.createdAt).toLocaleString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </td>
                          <td className="actions-cell">
                            <div className="admin-action-group">
                              <button
                                type="button"
                                className="admin-action-btn"
                                onClick={() => handleView(user)}
                                aria-label={`View details for ${name}`}
                              >
                                <LuEye aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn admin-action-btn--success"
                                onClick={() => handleApprove(user)}
                                aria-label={`Approve ${name}`}
                              >
                                <LuCheck aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn admin-action-btn--danger"
                                onClick={() => handleReject(user)}
                                aria-label={`Reject ${name}`}
                              >
                                <LuX aria-hidden="true" />
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

            {filteredUsers.length > 0 && totalPages > 1 && (
              <PaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={changePage}
                className="pagination"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ApproveUser;
