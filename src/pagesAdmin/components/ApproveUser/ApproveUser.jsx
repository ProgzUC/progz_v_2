import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { LuEye, LuCheck, LuX } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { usePendingUsers, useApproveUser, useRejectUser } from "../../../hooks/useAdminUsers";
import { approveUser, rejectUser } from "../../../api/userApi";
import Loader from "../../../components/common/Loader/Loader";
import PaginationBar from "../../../components/common/PaginationBar/PaginationBar";
import Swal from "sweetalert2";
import "./ApproveUser.css";

const getUserId = (user) => user._id || user.id;

const ApproveUser = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: pendingUsers = [], isLoading, isError, error } = usePendingUsers();
  const [activeTab, setActiveTab] = useState("student");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const itemsPerPage = 6;

  const filteredUsers = pendingUsers.filter(user => {
    const role = (user.role || "").toLowerCase();
    const matchesTab =
      activeTab === "student"
        ? role === "student"
        : role === "trainer" || role === "instructor";
    const matchesSearch = (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.source || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.zenCourseName || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedData = filteredUsers.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
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
      confirmButtonColor: isApprove ? "#0FA958" : "#d33",
      cancelButtonColor: "#6b7280",
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
    navigate('/admin/user-detail-view', { state: { user } });
  };

  const handleApprove = (user) => {
    Swal.fire({
      title: 'Approve User?',
      text: `Are you sure you want to approve ${user.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve!'
    }).then((result) => {
      if (result.isConfirmed) {
        approve(user._id || user.id);
        Swal.fire('Approved!', 'User has been approved.', 'success');
      }
    });
  };

  const handleReject = (user) => {
    Swal.fire({
      title: 'Reject User?',
      text: `Are you sure you want to reject ${user.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, reject!'
    }).then((result) => {
      if (result.isConfirmed) {
        reject(user._id || user.id);
        Swal.fire('Rejected!', 'User has been rejected.', 'success');
      }
    });
  };

  if (isLoading) return <Loader />;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div className="admin-approve-user-page">
      <div className="approve-user-header-main">
        <h1 className="page-title">Approve Users</h1>
        <div className="search-bar-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={`Search ${activeTab}s...`}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
              setSelectedIds(new Set());
            }}
          />
        </div>
      </div>

      <div className="pending-registrations-card">
        <h2 className="card-header">Pending Registrations</h2>
        <div className="approve-user-card">
          <div className="tab-container">
            <button
              className={`tab-btn ${activeTab === "student" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("student");
                setCurrentPage(1);
                setSelectedIds(new Set());
              }}
            >
              Students
            </button>
            <button
              className={`tab-btn ${activeTab === "trainer" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("trainer");
                setCurrentPage(1);
                setSelectedIds(new Set());
              }}
            >
              Trainers
            </button>
          </div>

          {selectedIds.size > 0 && (
            <div className="bulk-actions-bar">
              <span className="bulk-selection-count">
                {selectedIds.size} selected
              </span>
              <div className="bulk-actions-buttons">
                <button
                  type="button"
                  className="bulk-btn bulk-approve-btn"
                  disabled={isBulkProcessing}
                  onClick={() => runBulkAction("approve")}
                >
                  Approve Selected
                </button>
                <button
                  type="button"
                  className="bulk-btn bulk-reject-btn"
                  disabled={isBulkProcessing}
                  onClick={() => runBulkAction("reject")}
                >
                  Reject Selected
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
          <div className="table-responsive admin-table-wrap" tabIndex={0} aria-label="Pending registrations table">
            <table className="user-table admin-data-table">
              <caption className="sr-only">Pending {activeTab} registrations</caption>
              <colgroup>
                <col className="col-select" />
                <col className="col-sno" />
                <col className="col-name" />
                <col className="col-source" />
                {activeTab === "student" && <col className="col-course" />}
                <col className="col-date" />
                <col className="col-actions" />
              </colgroup>
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
                  <th className="s-no" scope="col">S.No</th>
                  <th className="col-name" scope="col">Name</th>
                  <th className="col-source" scope="col">Source</th>
                  {activeTab === "student" && (
                    <th className="col-course" scope="col">Zen Course</th>
                  )}
                  <th className="col-date" scope="col">Requested Date & Time</th>
                  <th className="col-actions" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === "student" ? "7" : "6"} className="empty-row">
                      No pending {activeTab}s found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((user, index) => {
                    const userId = getUserId(user);
                    const isSelected = selectedIds.has(userId);

                    return (
                    <tr key={userId} className={isSelected ? "row-selected" : ""}>
                      <td className="select-col">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(userId)}
                          disabled={isBulkProcessing}
                          aria-label={`Select ${user.name}`}
                        />
                      </td>
                      <td className="s-no">{(activePage - 1) * itemsPerPage + index + 1}</td>
                      <td className="col-name user-name">{user.name}</td>
                      <td className="col-source">{user.source || "-"}</td>
                      {activeTab === "student" && (
                        <td className="col-course">{user.zenCourseName || "-"}</td>
                      )}
                      <td className="col-date user-date">
                        {new Date(user.date || user.createdAt).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td className="col-actions action-icons">
                        <div className="admin-action-group">
                          <button
                            type="button"
                            className="admin-action-btn"
                            onClick={() => handleView(user)}
                            aria-label={`View details for ${user.name || "user"}`}
                          >
                            <LuEye aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="admin-action-btn"
                            onClick={() => handleApprove(user)}
                            aria-label={`Approve ${user.name || "user"}`}
                          >
                            <LuCheck aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="admin-action-btn admin-action-btn--danger"
                            onClick={() => handleReject(user)}
                            aria-label={`Reject ${user.name || "user"}`}
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

          {/* Pagination */}
          {filteredUsers.length > itemsPerPage && (
            <PaginationBar
              currentPage={activePage}
              totalPages={totalPages}
              onPageChange={changePage}
              className="pagination"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ApproveUser;
