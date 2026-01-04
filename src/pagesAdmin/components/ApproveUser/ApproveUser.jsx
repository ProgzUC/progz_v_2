import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ApproveUser.css";

const ApproveUser = () => {
  const navigate = useNavigate();
  const [pendingUsers] = useState([
    { id: 1, name: "Tharun", email: "tharun@progz.tech", date: "12/11/2025" },
    { id: 2, name: "Sanjana", email: "sanjana@progz.tech", date: "12/11/2025" },
    { id: 3, name: "Preethi", email: "preethi@progz.tech", date: "12/11/2025" },
    { id: 4, name: "Roshini", email: "roshini@progz.tech", date: "12/11/2025" },
    { id: 5, name: "Deva", email: "deva@progz.tech", date: "12/11/2025" },
    { id: 6, name: "Karthick", email: "karthick@progz.tech", date: "12/11/2025" },
    { id: 7, name: "Tharun", email: "tharun@progz.tech", date: "12/11/2025" }
  ]);

  const handleView = (user) => {
    console.log("View user:", user);
    navigate('/dashboard/user-detail-view', { state: { user } });
  };

  const handleApprove = (user) => {
    console.log("Approve user:", user);
    // Add approval logic here
  };

  const handleReject = (user) => {
    console.log("Reject user:", user);
    // Add rejection logic here
  };

  return (
    <div className="approve-users-page">
      <h1 className="page-title">Approve Users</h1>

      <div className="pending-registrations-card">
        <h2 className="card-header">Pending Registrations</h2>

        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mail</th>
                <th>Requested Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) => (
                <tr key={user.id}>
                  <td className="user-name">{user.name}</td>
                  <td className="user-email">{user.email}</td>
                  <td className="user-date">{user.date}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApproveUser;
