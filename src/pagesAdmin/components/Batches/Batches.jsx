import React, { useState } from "react";
import "./Batches.css";
import "../Modal.css";
import { FaTrash } from "react-icons/fa";
import { MdFilterList } from "react-icons/md";
import Swal from "sweetalert2";

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
    const [selectedIds, setSelectedIds] = useState([]);
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

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedBatches.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedBatches.map(batch => batch.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return;

        Swal.fire({
            title: "Delete multiple batches?",
            text: `Are you sure you want to delete ${selectedIds.length} selected batches?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, delete them!",
            background: "#fff",
            color: "#333",
            borderRadius: "15px"
        }).then((result) => {
            if (result.isConfirmed) {
                setBatches(batches.filter(batch => !selectedIds.includes(batch.id)));
                setSelectedIds([]);
                Swal.fire({
                    title: "Deleted!",
                    text: "Selected batches have been deleted.",
                    icon: "success",
                    confirmButtonColor: "#28a745",
                    timer: 1500
                });
            }
        });
    };

    const handleDelete = (batch) => {
        Swal.fire({
            title: "Delete Batch?",
            text: `Are you sure you want to delete "${batch.name}"? This action cannot be undone.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete!",
            background: "#fff",
            color: "#333",
            borderRadius: "15px"
        }).then((result) => {
            if (result.isConfirmed) {
                setBatches(batches.filter(b => b.id !== batch.id));
                setSelectedIds(prev => prev.filter(i => i !== batch.id));
                Swal.fire({
                    title: "Deleted!",
                    text: `"${batch.name}" has been deleted successfully.`,
                    icon: "success",
                    confirmButtonColor: "#28a745",
                    timer: 1500
                });
            }
        });
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
                    <span className="stat-value">{batches.length}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Active Batches</span>
                    <span className="stat-value">{batches.filter(b => b.status === "Active").length}</span>
                </div>

                {selectedIds.length > 0 && (
                    <button className="bulk-delete-btn" onClick={handleDeleteSelected}>
                        <FaTrash /> Delete Selected ({selectedIds.length})
                    </button>
                )}

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
                                <th style={{ width: "40px" }}>
                                    <input
                                        type="checkbox"
                                        checked={paginatedBatches.length > 0 && selectedIds.length === paginatedBatches.length}
                                        onChange={toggleSelectAll}
                                        className="batch-checkbox"
                                    />
                                </th>
                                <th>Batch</th>
                                <th>Student</th>
                                <th>Instructor</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right", paddingRight: "20px" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedBatches.map((batch) => (
                                <tr key={batch.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(batch.id)}
                                            onChange={() => toggleSelect(batch.id)}
                                            className="batch-checkbox"
                                        />
                                    </td>
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
                                    <td style={{ textAlign: "right", paddingRight: "20px" }}>
                                        <FaTrash
                                            className="delete-icon"
                                            onClick={() => handleDelete(batch)}
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


        </div>
    );
};

export default Batches;
