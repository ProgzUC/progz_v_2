import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePendingUsers, useApproveUser, useRejectUser } from "../../../hooks/useAdminUsers";
import Loader from "../../../components/common/Loader/Loader";
import Swal from "sweetalert2";
import "./ApproveUser.css";

const ApproveUser = () => {
  const navigate = useNavigate();

  const { data: pendingUsers = [], isLoading, isError, error } = usePendingUsers();
  const [activeTab, setActiveTab] = useState("student");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredUsers = pendingUsers.filter(user => user.role?.toLowerCase() === activeTab);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedData = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
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
    <div className="approve-users-page">
      <h1 className="page-title">Approve Users</h1>

      <div className="pending-registrations-card">
        <h2 className="card-header">Pending Registrations</h2>
        <div className="approve-user-card">
          <div className="tab-container">
            <button
              className={`tab-btn ${activeTab === "student" ? "active" : ""}`}
              onClick={() => setActiveTab("student")}
            >
              Students
            </button>
            <button
              className={`tab-btn ${activeTab === "trainer" ? "active" : ""}`}
              onClick={() => setActiveTab("trainer")}
            >
              Trainers
            </button>
          </div>

          <div className="table-responsive">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Source</th>
                  {activeTab === "student" && <th>Zen Course</th>}
                  <th>Requested Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === "student" ? "5" : "4"} style={{ textAlign: "center" }}>No pending {activeTab}s found</td>
                  </tr>
                ) : (
                  paginatedData.map((user) => (
                    <tr key={user._id || user.id}>
                      <td className="user-name">{user.name}</td>
                      <td>{user.source || "-"}</td>
                      {activeTab === "student" && <td>{user.zenCourseName || "-"}</td>}
                      <td className="user-date">
                        {new Date(user.date || user.createdAt).toLocaleDateString("en-US", {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="action-icons">
                        <button
                          className="icon-btn view-btn"
                          onClick={() => handleView(user)}
                          title="View details"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                        </button>
                        <button
                          className="icon-btn approve-btn"
                          onClick={() => handleApprove(user)}
                          title="Approve"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </button>
                        <button
                          className="icon-btn reject-btn"
                          onClick={() => handleReject(user)}
                          title="Reject"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredUsers.length > itemsPerPage && (
            <div className="pagination">
              <button className="page-arrow" onClick={() => changePage(currentPage - 1)}>&lt;</button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                  onClick={() => changePage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button className="page-arrow" onClick={() => changePage(currentPage + 1)}>&gt;</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApproveUser;
