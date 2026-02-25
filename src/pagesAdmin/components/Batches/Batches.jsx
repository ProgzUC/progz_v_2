import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Batches.css";
import "../Modal.css";
import { FaTrash, FaEye, FaEdit, FaUserPlus, FaPlus, FaSearch } from "react-icons/fa";
import { MdFilterList } from "react-icons/md";
import Swal from "sweetalert2";
import { useBatches, useDeleteBatch } from "../../../hooks/useBatches";
import { useCourses } from "../../../hooks/useCourses";
import Loader from "../../../components/common/Loader/Loader";
import CreateBatchModal from "../EnrollStudent/CreateBatchModal";
import AddStudentToBatchModal from "./AddStudentToBatchModal";
import EditBatchModal from "./EditBatchModal"; // Import the add student modal

const Batches = () => {
    // 1. Fetch Dynamic Data
    const { data: batchesData, isLoading, isError } = useBatches();
    const { mutate: deleteBatchMutation } = useDeleteBatch();
    const { data: coursesData } = useCourses();
    const navigate = useNavigate();

    const batches = batchesData || [];
    const coursesList = coursesData || [];
    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBatch, setSelectedBatch] = useState(null); // For View More
    const [selectedBatchForEnroll, setSelectedBatchForEnroll] = useState(null); // For Add Student
    const [selectedBatchForEdit, setSelectedBatchForEdit] = useState(null); // For Edit

    const [showModal, setShowModal] = useState(false); // View More Modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddStudentModal, setShowAddStudentModal] = useState(false); // Add Student Modal
    const [showEditModal, setShowEditModal] = useState(false); // Edit Modal

    const [filterStatus, setFilterStatus] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const itemsPerPage = 10;

    // Filter Logic 
    const filteredBatches = batches.filter(batch => {
        const matchesStatus = filterStatus === "All" || (batch.status || "").toLowerCase() === filterStatus.toLowerCase();
        const matchesSearch = (batch.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (batch.course?.courseName || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

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
        navigate(`/admin/batches/${batch._id || batch.id}`);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedBatch(null);
    };

    // Open Add Student Modal
    const handleAddStudent = (batch) => {
        setSelectedBatchForEnroll(batch);
        setShowAddStudentModal(true);
    };

    const handleEditBatch = (batch) => {
        setSelectedBatchForEdit(batch);
        setShowEditModal(true);
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
        }).then((result) => {
            if (result.isConfirmed) {
                deleteBatchMutation(batch._id || batch.id);
            }
        });
    };

    const getStatusClass = (status) => {
        const s = (status || "").toLowerCase();
        switch (s) {
            case "active": return "status-active";
            case "completed": return "status-completed";
            case "upcoming": return "status-inactive";
            default: return "";
        }
    };

    const getCourseName = (batch) => {
        return batch.course?.courseName || "—";
    };

    const getInstructors = (batch) => {
        if (!batch.trainers || batch.trainers.length === 0) return "—";
        return batch.trainers
            .map(t => t.trainer?.name || t.trainer?.firstName || "Unknown")
            .filter(Boolean)
            .join(", ");
    };

    const getFirstInstructorInitials = (batch) => {
        if (!batch.trainers || batch.trainers.length === 0) return "-";
        const name = batch.trainers[0].trainer?.name || "U";
        return name.charAt(0).toUpperCase();
    };


    if (isLoading) return <Loader />;
    if (isError) return <div className="error-message">Failed to load batches.</div>;

    return (
        <div className="admin-batches-page">
            <div className="batches-header-main">
                <h1>Batches Management</h1>
                <button
                    className="create-batch-btn"
                    onClick={() => setShowCreateModal(true)}
                    style={{
                        background: '#10a358',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '600'
                    }}
                >
                    <FaPlus /> Create Batch
                </button>
            </div>

            <div className="batches-stats-row">
                <div className="stat-card">
                    <span className="stat-label">Total Batches</span>
                    <span className="stat-value">{batches.length}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Active Batches</span>
                    <span className="stat-value">{batches.filter(b => (b.status || "").toLowerCase() === "active").length}</span>
                </div>

                <div className="filter-controls-container">
                    <div className="search-bar-container">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by batch or course..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    <div className="filter-controls">
                        <MdFilterList className="filter-icon" />
                        <select
                            className="filter-select"
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="All">All Status</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="upcoming">Upcoming</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="batches-table-container">
                <h2 className="table-title">Batches List</h2>
                <div className="table-responsive">
                    <table className="batches-table">
                        <thead>
                            <tr>
                                <th className="s-no">S.No</th>
                                <th>Batch Name</th>
                                <th>Course</th>
                                <th>Instructors</th>
                                <th>Start Date</th>
                                <th style={{ textAlign: "center" }}>Students</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right", paddingRight: "20px" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedBatches.length > 0 ? (
                                paginatedBatches.map((batch, index) => (
                                    <tr key={batch._id || batch.id}>
                                        <td className="s-no">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td>
                                            <div className="batch-name-cell">
                                                <strong>{batch.name}</strong>
                                                <span
                                                    className="view-more"
                                                    onClick={() => handleViewMore(batch)}
                                                    style={{ fontSize: '11px', color: '#888' }}
                                                >
                                                    {batch._id}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{getCourseName(batch)}</td>
                                        <td>
                                            <div className="instructor-cell">
                                                {/* <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                                                    {getFirstInstructorInitials(batch)}
                                                </div> */}
                                                <span>{getInstructors(batch)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "—"}
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            <span style={{ background: '#f0fdf4', color: '#166534', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                                                {batch.students?.length || 0}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(batch.status)}`}>
                                                <span className="dot"></span>
                                                {batch.status || "Unknown"}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "right", paddingRight: "20px" }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => handleAddStudent(batch)}
                                                    title="Add Student"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981' }}
                                                >
                                                    <FaUserPlus />
                                                </button>
                                                <button
                                                    onClick={() => handleEditBatch(batch)}
                                                    title="Edit Batch"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleViewMore(batch)}
                                                    title="View Details"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(batch)}
                                                    title="Delete"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>No batches found</td>
                                </tr>
                            )}
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
                    <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ minWidth: '400px' }}>
                        <h3>Batch Details</h3>
                        <p><strong>Batch:</strong> {selectedBatch.name}</p>
                        <p><strong>Course:</strong> {getCourseName(selectedBatch)}</p>
                        <p><strong>Status:</strong> {selectedBatch.status}</p>
                        <p><strong>Start Date:</strong> {selectedBatch.startDate ? new Date(selectedBatch.startDate).toLocaleDateString() : "N/A"}</p>
                        <p><strong>Instructors:</strong> {getInstructors(selectedBatch)}</p>

                        <div className="modal-students-list">
                            <strong>Students ({selectedBatch.students?.length || 0}):</strong>
                            {selectedBatch.students && selectedBatch.students.length > 0 ? (
                                <ul style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                    {selectedBatch.students.map((s, i) => (
                                        // Handle if students are populated objects or just IDs
                                        <li key={i}>{typeof s === 'object' ? (s.name || s.email) : s}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{ color: '#999', fontSize: '13px', fontStyle: 'italic' }}>No students enrolled.</p>
                            )}
                        </div>
                        <button className="close-btn" onClick={closeModal}>X</button>
                    </div>
                </div>
            )}

            {/* Create Batch Modal */}
            <CreateBatchModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                coursesList={coursesList}
                weekDays={weekDays}
            />

            {/* Add Student Modal */}
            <AddStudentToBatchModal
                isOpen={showAddStudentModal}
                onClose={() => setShowAddStudentModal(false)}
                batch={selectedBatchForEnroll}
            />

            {/* Edit Batch Modal */}
            <EditBatchModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                batch={selectedBatchForEdit}
                coursesList={coursesList}
                weekDays={weekDays}
            />

        </div>
    );
};

export default Batches;
