import React, { useState } from "react";
import "./Batches.css";
import "../Modal.css";
import { FaTrash } from "react-icons/fa";
import { MdFilterList } from "react-icons/md";

const Batches = () => {
    const [batches, setBatches] = useState([
        { id: 1, name: "FSD-March Morning", student: "Alice Johnson", students: ["Alice Johnson"], instructor: "David Miller", initials: "DM", status: "Active" },
        { id: 2, name: "FSD-March Morning", student: "Alice Johnson", students: ["Alice Johnson"], instructor: "David Miller", initials: "DM", status: "Completed" },
        { id: 3, name: "FSD-March Morning", student: "Alice Johnson", students: ["Alice Johnson"], instructor: "David Miller", initials: "DM", status: "Active" },
        { id: 4, name: "FSD-March Morning", student: "Alice Johnson", students: ["Alice Johnson"], instructor: "David Miller", initials: "DM", status: "Active" },
        { id: 5, name: "FSD-March Morning", student: "Alice Johnson", students: ["Alice Johnson"], instructor: "David Miller", initials: "DM", status: "Completed" },
        { id: 6, name: "FSD-March Morning", student: "Alice Johnson", students: ["Alice Johnson"], instructor: "David Miller", initials: "DM", status: "Active" },
        { id: 7, name: "FSD-March Morning", student: "Alice Johnson", students: ["Alice Johnson"], instructor: "David Miller", initials: "DM", status: "Active" },
        { id: 8, name: "FSD-March Morning", student: "Alice Johnson", students: ["Alice Johnson", "Mark Refalo", "Sarah Smith"], instructor: "David Miller", initials: "DM", status: "Inactive", showViewMore: true },
        { id: 9, name: "FSD-March Morning", student: "Alice Johnson", students: ["Alice Johnson", "Bob Wilson"], instructor: "David Miller", initials: "DM", status: "Inactive", showViewMore: true },
    ]);

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [batchToDelete, setBatchToDelete] = useState(null);
    const [filterStatus, setFilterStatus] = useState("All");
    const itemsPerPage = 5;

    const filteredBatches = batches.filter(batch =>
        filterStatus === "All" || batch.status === filterStatus
    );

    const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);
    const paginatedBatches = filteredBatches.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (pageNum) => {
        if (pageNum >= 1 && pageNum <= totalPages) {
            setCurrentPage(pageNum);
        }
    };

    const handleViewMore = (batch) => {
        setSelectedBatch(batch);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedBatch(null);
    };

    const handleDelete = (id) => {
        setBatchToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        setBatches(batches.filter(batch => batch.id !== batchToDelete));
        setShowDeleteModal(false);
        setBatchToDelete(null);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setBatchToDelete(null);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Active": return "status-active";
            case "Completed": return "status-completed";
            case "Inactive": return "status-inactive";
            default: return "";
        }
    };

    return (
        <div className="batches-page">
            <div className="batches-header-main">
                <h1>Batches</h1>
            </div>

            <div className="batches-stats-row">
                <div className="stat-card">
                    <span className="stat-label">Total Batches</span>
                    <span className="stat-value">22</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Active Batches</span>
                    <span className="stat-value">14</span>
                </div>
                <div className="filter-controls">
                    <MdFilterList className="filter-icon" />
                    <select
                        className="filter-select"
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setCurrentPage(1); // Reset to first page on filter change
                        }}
                    >
                        <option value="All">All</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>

            <div className="batches-table-container">
                <h2 className="table-title">Batches</h2>
                <div className="table-responsive">
                    <table className="batches-table">
                        <thead>
                            <tr>
                                <th>Batch</th>
                                <th>Student</th>
                                <th>Instructor</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedBatches.map((batch) => (
                                <tr key={batch.id}>
                                    <td>
                                        <div className="batch-name-cell">
                                            {batch.name}
                                            {batch.showViewMore && (
                                                <span className="view-more" onClick={() => handleViewMore(batch)}>
                                                    View more
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{batch.student}</td>
                                    <td>
                                        <div className="instructor-cell">
                                            <div className="avatar">{batch.initials}</div>
                                            <span>{batch.instructor}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(batch.status)}`}>
                                            <span className="dot"></span>
                                            {batch.status}
                                        </span>
                                    </td>
                                    <td>
                                        <FaTrash
                                            className="delete-icon"
                                            onClick={() => handleDelete(batch.id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="batches-pagination">
                    <button
                        className="page-nav"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >&lt;</button>

                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            className={`page-num ${currentPage === i + 1 ? "active" : ""}`}
                            onClick={() => handlePageChange(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        className="page-nav"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >&gt;</button>
                </div>
            </div>

            {/* View More Modal */}
            {showModal && selectedBatch && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h3>Batch Details</h3>
                        <p><strong>Batch:</strong> {selectedBatch.name}</p>
                        <p><strong>Instructor:</strong> {selectedBatch.instructor}</p>
                        <div className="modal-students-list">
                            <strong>Students:</strong>
                            <ul>
                                {selectedBatch.students.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </div>
                        <button className="close-btn" onClick={closeModal}>X</button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={cancelDelete}>
                    <div className="delete-modal-box" onClick={(e) => e.stopPropagation()}>
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this batch? This action cannot be undone.</p>
                        <div className="delete-modal-actions">
                            <button className="cancel-btn" onClick={cancelDelete}>Cancel</button>
                            <button className="confirm-btn" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Batches;
