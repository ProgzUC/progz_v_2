import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Batches.css";
import "../Modal.css";
import { LuUserPlus, LuEye, LuPencil, LuTrash2 } from "react-icons/lu";
import Swal from "sweetalert2";
import { useBatches, useDeleteBatch } from "../../../hooks/useBatches";
import { useCourses } from "../../../hooks/useCourses";
import Loader from "../../../components/common/Loader/Loader";
import PaginationBar from "../../../components/common/PaginationBar/PaginationBar";
import PersonStack from "../../../components/common/PersonStack/PersonStack";
import CreateBatchModal from "../EnrollStudent/CreateBatchModal";
import AddStudentToBatchModal from "./AddStudentToBatchModal";
import EditBatchModal from "./EditBatchModal";
import AccessibleModal from "../../../components/common/AccessibleModal/AccessibleModal";
import AppSelect from "../../../components/common/AppSelect/AppSelect";
import { formatBatchCourseNames, getBatchCourseNames } from "../../../features/batches/batchFormState";

const Batches = () => {
  const { data: batchesData, isLoading, isError, error } = useBatches();
  const { mutate: deleteBatchMutation } = useDeleteBatch();
  const { data: coursesData } = useCourses();
  const navigate = useNavigate();

  const batches = batchesData || [];
  const coursesList = coursesData || [];
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedBatchForEnroll, setSelectedBatchForEnroll] = useState(null);
  const [selectedBatchForEdit, setSelectedBatchForEdit] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const rowsPerPage = 7;

  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      const matchesStatus =
        !filterStatus || (batch.status || "").toLowerCase() === filterStatus.toLowerCase();
      const matchesSearch =
        (batch.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        getBatchCourseNames(batch).join(" ").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [batches, filterStatus, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredBatches.length / rowsPerPage);
  const paginatedBatches = filteredBatches.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleViewMore = (batch) => {
    navigate(`/admin/batches/${batch._id || batch.id}`);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBatch(null);
  };

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
      background: "#fff",
      color: "#333",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBatchMutation(batch._id || batch.id);
      }
    });
  };

  const getStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "active":
        return "status-active";
      case "completed":
        return "status-completed";
      case "upcoming":
        return "status-upcoming";
      default:
        return "";
    }
  };

  const getCourseName = (batch) => formatBatchCourseNames(batch);

  const getTrainerList = (batch) => {
    if (!batch.trainers || batch.trainers.length === 0) return [];
    return batch.trainers
      .map((t) => t.trainer?.name || t.trainer?.firstName || "Unknown")
      .filter(Boolean);
  };

  return (
    <div className="admin-batches-page">
      <header className="page-hero">
        <h1 className="page-title">Batch management</h1>
        <p className="page-subtitle">
          Create batches, assign instructors and track enrolled students.
        </p>
      </header>

      <div className="top-row">
        <div className="search-actions">
          <div className="search-box">
            <i className="bi bi-search" aria-hidden="true"></i>
            <input
              type="text"
              placeholder="Search batches"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search batches"
            />
          </div>

          <div className="status-filter">
            <AppSelect
              icon="bi-funnel"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter by status"
              options={[
                { value: "", label: "All status" },
                { value: "active", label: "Active" },
                { value: "completed", label: "Completed" },
                { value: "upcoming", label: "Upcoming" },
              ]}
            />
            {filterStatus && (
              <button
                type="button"
                className="clear-filter-btn"
                onClick={() => setFilterStatus("")}
                title="Clear filter"
                aria-label="Clear status filter"
              >
                <i className="bi bi-x" aria-hidden="true" />
              </button>
            )}
          </div>

          <button
            type="button"
            className="create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            + Create new batch
          </button>
        </div>
      </div>

      <div className="content-card">
        <div className="card-title-row">
          <h2 className="card-title">All batches</h2>
          <span className="card-count">{filteredBatches.length} shown</span>
        </div>

        {isLoading ? (
          <Loader />
        ) : isError ? (
          <div className="page-error">
            Error loading batches: {error?.message || "Something went wrong"}
          </div>
        ) : (
          <>
            <p className="admin-table-scroll-hint">Swipe horizontally to view all columns.</p>
            <div
              className="table-responsive admin-table-wrap"
              tabIndex={0}
              aria-label="Batches table"
            >
              <table className="data-table admin-data-table">
                <caption className="sr-only">All batches</caption>
                <thead>
                  <tr>
                    <th scope="col">S.No</th>
                    <th scope="col">Batch</th>
                    <th scope="col">Course</th>
                    <th scope="col">Instructors</th>
                    <th scope="col">Start Date</th>
                    <th scope="col">Students</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBatches.length > 0 ? (
                    paginatedBatches.map((batch, index) => {
                      const trainers = getTrainerList(batch);
                      const studentCount = batch.students?.length || 0;
                      return (
                        <tr key={batch._id || batch.id}>
                          <td className="col-sno">
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </td>
                          <td className="col-batch">{batch.name}</td>
                          <td>{getCourseName(batch) || "—"}</td>
                          <td>
                            <PersonStack names={trainers} />
                          </td>
                          <td>
                            {batch.startDate
                              ? new Date(batch.startDate).toLocaleDateString()
                              : "—"}
                          </td>
                          <td>
                            <span className="enrolled-badge">
                              {studentCount} {studentCount === 1 ? "student" : "students"}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${getStatusClass(batch.status)}`}>
                              <span className="dot" aria-hidden="true"></span>
                              {batch.status || "Unknown"}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <div className="admin-action-group">
                              <button
                                type="button"
                                className="admin-action-btn"
                                aria-label={`Add student to ${batch.name}`}
                                onClick={() => handleAddStudent(batch)}
                              >
                                <LuUserPlus aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn"
                                aria-label={`View ${batch.name}`}
                                onClick={() => handleViewMore(batch)}
                              >
                                <LuEye aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn"
                                aria-label={`Edit ${batch.name}`}
                                onClick={() => handleEditBatch(batch)}
                              >
                                <LuPencil aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn admin-action-btn--danger"
                                aria-label={`Delete ${batch.name}`}
                                onClick={() => handleDelete(batch)}
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
                      <td colSpan="8" className="empty-row">
                        No batches found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredBatches.length > 0 && totalPages > 1 && (
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

      {showModal && selectedBatch && (
        <AccessibleModal isOpen={showModal} onClose={closeModal} title="Batch Details">
          <p>
            <strong>Batch:</strong> {selectedBatch.name}
          </p>
          <p>
            <strong>Course:</strong> {getCourseName(selectedBatch)}
          </p>
          <p>
            <strong>Status:</strong> {selectedBatch.status}
          </p>
          <p>
            <strong>Start Date:</strong>{" "}
            {selectedBatch.startDate
              ? new Date(selectedBatch.startDate).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Instructors:</strong>{" "}
            {getTrainerList(selectedBatch).join(", ") || "—"}
          </p>

          <div className="modal-students-list">
            <strong>Students ({selectedBatch.students?.length || 0}):</strong>
            {selectedBatch.students && selectedBatch.students.length > 0 ? (
              <ul>
                {selectedBatch.students.map((s, i) => (
                  <li key={i}>{typeof s === "object" ? s.name || s.email : s}</li>
                ))}
              </ul>
            ) : (
              <p className="modal-empty">No students enrolled.</p>
            )}
          </div>
          <button type="button" className="close-btn" onClick={closeModal}>
            Close
          </button>
        </AccessibleModal>
      )}

      <CreateBatchModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        coursesList={coursesList}
        weekDays={weekDays}
      />

      <AddStudentToBatchModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        batch={selectedBatchForEnroll}
      />

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
