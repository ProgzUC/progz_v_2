import React, { useState } from "react";
import "./EnrollStudents.css";

import { useAllUsers, usePendingUsers } from "../../../hooks/useAdminUsers";
import { useCourses } from "../../../hooks/useCourses";
import { useBatches, useEnrollStudent } from "../../../hooks/useBatches";
import { bulkEnrollStudents } from "../../../api/batchApi";
import Swal from "sweetalert2";
import Loader from "../../../components/common/Loader/Loader";
import { createId } from "../../../utils/courseBuilder";

import CreateBatchModal from "./CreateBatchModal";

const EnrollStudents = () => {
  // Data Fetching
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useAllUsers();
  const { data: pendingUsers, isLoading: pendingLoading, refetch: refetchPending } = usePendingUsers();
  const { data: coursesData, isLoading: coursesLoading } = useCourses();
  const { data: batchesData, isLoading: batchesLoading, refetch: refetchBatches } = useBatches();

  const { mutate: enrollStudentMutation } = useEnrollStudent();

  // Tabs
  const [activeTab, setActiveTab] = useState("single"); // "single" | "bulk" | "csv"

  // Filtered Data
  const usersArray = Array.isArray(users) ? users : [];
  const studentsList = usersArray.filter(u => (u.role || "").toLowerCase() === "student");
  const pendingStudentsList = (Array.isArray(pendingUsers) ? pendingUsers : [])
    .filter(u => (u.role || "").toLowerCase() === "student");
  
  const instructorsList = usersArray.filter(
    u => (u.role || "").toLowerCase() === "trainer" || (u.role || "").toLowerCase() === "instructor"
  );
  const coursesList = coursesData || [];
  const batchesList = batchesData || [];

  // Single Enrollment State
  const [selectedStudent, setSelectedStudent] = useState("");
  const [courseSections, setCourseSections] = useState([
    { id: createId(), courseId: "", instructorId: "", batchId: "" }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Bulk Multi-Select State
  const [bulkBatchId, setBulkBatchId] = useState("");
  const [selectedActiveIds, setSelectedActiveIds] = useState([]);
  const [selectedPendingIds, setSelectedPendingIds] = useState([]);
  const [bulkSearch, setBulkSearch] = useState("");
  const [bulkFilterStatus, setBulkFilterStatus] = useState("all"); // "all" | "active" | "pending"

  // CSV Import State
  const [csvBatchId, setCsvBatchId] = useState("");
  const [parsedEmails, setParsedEmails] = useState([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [isParsing, setIsParsing] = useState(false);

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleRefreshData = () => {
    refetchUsers();
    refetchPending();
    refetchBatches();
  };

  /* CSV File Parser */
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvFileName(file.name);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        // Split by linebreaks
        const lines = text.split(/\r?\n/);
        const emailsFound = [];

        lines.forEach((line) => {
          // Match simple email pattern in raw csv columns
          const columns = line.split(",");
          columns.forEach((col) => {
            const trimmed = col.trim();
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
              emailsFound.push(trimmed.toLowerCase());
            }
          });
        });

        // Deduplicate
        const uniqueEmails = [...new Set(emailsFound)];
        setParsedEmails(uniqueEmails);

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: `Parsed ${uniqueEmails.length} unique emails from CSV`,
          showConfirmButton: false,
          timer: 3000
        });
      } catch (err) {
        Swal.fire("Error", "Failed to parse CSV file. Ensure standard column strings.", "error");
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsText(file);
  };

  /* Single Enroll Submission */
  const updateSection = (id, field, value) => {
    setCourseSections(prev => prev.map(sec =>
      sec.id === id ? { ...sec, [field]: value } : sec
    ));
  };

  const addCourse = () => {
    setCourseSections([...courseSections, { id: createId(), courseId: "", instructorId: "", batchId: "" }]);
  };

  const deleteCourse = (id) => {
    if (courseSections.length > 1) {
      setCourseSections(courseSections.filter((sec) => sec.id !== id));
    }
  };

  const handleEnroll = () => {
    if (!selectedStudent) {
      Swal.fire("Error", "Please select a student", "error");
      return;
    }

    const validSections = courseSections.filter(s => s.courseId && s.batchId);
    if (validSections.length === 0) {
      Swal.fire("Error", "Please select at least one Course and Batch", "error");
      return;
    }

    const payload = {
      studentId: selectedStudent,
      enrollments: validSections.map(s => ({
        courseId: s.courseId,
        batchId: s.batchId,
        instructorId: s.instructorId
      }))
    };

    enrollStudentMutation(payload, {
      onSuccess: () => {
        Swal.fire("Success", "Student Enrolled Successfully!", "success");
        handleRefreshData();
      },
      onError: (err) => {
        Swal.fire("Error", err.response?.data?.message || "Enrollment failed", "error");
      }
    });
  };

  /* Bulk Enrollment Submissions */
  const handleBulkEnroll = async () => {
    if (!bulkBatchId) {
      Swal.fire("Warning", "Please select a target batch first.", "warning");
      return;
    }

    if (selectedActiveIds.length === 0 && selectedPendingIds.length === 0) {
      Swal.fire("Warning", "No students selected. Tick checkboxes next to the names.", "warning");
      return;
    }

    Swal.fire({
      title: "Enrolling Students",
      text: "Adding selected students and auto-approving any pending CRM leads...",
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      const response = await bulkEnrollStudents({
        batchId: bulkBatchId,
        studentIds: selectedActiveIds,
        pendingStudentIds: selectedPendingIds
      });

      Swal.fire({
        title: "Bulk Enrollment Success",
        html: `Successfully enrolled: <strong>${response.enrolledCount}</strong> students.<br/>Approved pending leads: <strong>${response.approvedCount}</strong>.`,
        icon: "success"
      });

      // Clear selections
      setSelectedActiveIds([]);
      setSelectedPendingIds([]);
      handleRefreshData();
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to process bulk enrollment", "error");
    }
  };

  /* CSV Import Submission */
  const handleCSVEnroll = async () => {
    if (!csvBatchId) {
      Swal.fire("Warning", "Please select a target batch first.", "warning");
      return;
    }

    if (parsedEmails.length === 0) {
      Swal.fire("Warning", "Please upload a CSV file containing valid emails.", "warning");
      return;
    }

    Swal.fire({
      title: "Importing CSV Emails",
      text: "Resolving emails, approving pending leads, and enrolling...",
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      const response = await bulkEnrollStudents({
        batchId: csvBatchId,
        emails: parsedEmails
      });

      let alertText = `Successfully enrolled: <strong>${response.enrolledCount}</strong> students.<br/>Approved pending CRM profiles: <strong>${response.approvedCount}</strong>.`;
      
      if (response.errors && response.errors.length > 0) {
        alertText += `<br/><br/><div style="text-align:left; font-size:12px; color:#ef4444; max-height:100px; overflow-y:auto;"><strong>Skipped / Failed:</strong><br/>${response.errors.map(e => `• ${e}`).join("<br/>")}</div>`;
      }

      Swal.fire({
        title: "CSV Enrollment Run",
        html: alertText,
        icon: response.errors && response.errors.length > 0 ? "info" : "success"
      });

      // Clear CSV state
      setParsedEmails([]);
      setCsvFileName("");
      handleRefreshData();
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to import CSV", "error");
    }
  };

  // Toggle Checkbox selection
  const toggleActiveSelect = (id) => {
    setSelectedActiveIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const togglePendingSelect = (id) => {
    setSelectedPendingIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getFilteredBulkList = () => {
    let list = [];
    if (bulkFilterStatus === "all" || bulkFilterStatus === "active") {
      list.push(...studentsList.map(s => ({ ...s, isPending: false })));
    }
    if (bulkFilterStatus === "all" || bulkFilterStatus === "pending") {
      list.push(...pendingStudentsList.map(s => ({ ...s, isPending: true })));
    }

    if (bulkSearch) {
      const query = bulkSearch.toLowerCase();
      list = list.filter(
        s => (s.name || "").toLowerCase().includes(query) || (s.email || "").toLowerCase().includes(query)
      );
    }
    return list;
  };

  if (usersLoading || pendingLoading || coursesLoading || batchesLoading) return <Loader />;

  return (
    <div className="admin-enroll-students-page p-4">
      <div className="enroll-dashboard-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Student Course Enrollment</h2>
          <p className="text-secondary">Enroll individual students, bulk multi-select active/pending users, or upload CSV files</p>
        </div>
        <div className="enroll-tab-menu glass-card">
          <button
            onClick={() => setActiveTab("single")}
            className={activeTab === "single" ? "active" : ""}
          >
            Single User
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={activeTab === "bulk" ? "active" : ""}
          >
            Bulk Multi-Select
          </button>
          <button
            onClick={() => setActiveTab("csv")}
            className={activeTab === "csv" ? "active" : ""}
          >
            CSV Import
          </button>
        </div>
      </div>

      <div className="enroll-container glass-card p-4">
        {/* TAB 1: SINGLE USER ENROLLMENT */}
        {activeTab === "single" && (
          <div className="tab-pane-content">
            <h3 className="pane-title mb-3">Individual Student Enrollment</h3>
            {/* Student Info */}
            <div className="section-block mb-3">
              <label className="section-label">Select Student Profile</label>
              <select
                className="input-select"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="">Select student</option>
                {studentsList.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                ))}
              </select>
            </div>

            {/* Course Sections */}
            {courseSections.map((section, idx) => (
              <div key={section.id} className="section-block border-top border-secondary pt-3 mb-3">
                <div className="title-row d-flex justify-content-between align-items-center mb-2">
                  <h4 className="section-title">Course Session – {idx + 1}</h4>
                  <div className="title-buttons">
                    {idx === 0 && (
                      <button className="btn btn-sm btn-outline-emerald" onClick={addCourse}>
                        + Add Another Course
                      </button>
                    )}
                    {idx !== 0 && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteCourse(section.id)}
                        title="Delete Course Section"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid-select-group mb-2">
                  <select
                    className="input-select"
                    value={section.courseId}
                    onChange={(e) => updateSection(section.id, "courseId", e.target.value)}
                  >
                    <option value="">Select course</option>
                    {coursesList.map((c) => (
                      <option key={c._id} value={c._id}>{c.courseName}</option>
                    ))}
                  </select>

                  <select
                    className="input-select"
                    value={section.instructorId}
                    onChange={(e) => updateSection(section.id, "instructorId", e.target.value)}
                  >
                    <option value="">Select instructor</option>
                    {instructorsList.map((ins) => (
                      <option key={ins._id} value={ins._id}>{ins.name}</option>
                    ))}
                  </select>

                  <div className="batch-select-box">
                    <select
                      className="input-select"
                      value={section.batchId}
                      onChange={(e) => updateSection(section.id, "batchId", e.target.value)}
                    >
                      <option value="">Select batch</option>
                      {batchesList
                        .filter(b => {
                          if (!section.courseId) return true;
                          const batchCourseId = b.course?._id || b.course;
                          return batchCourseId === section.courseId;
                        })
                        .map((b) => (
                          <option key={b._id} value={b._id}>{b.name}</option>
                        ))}
                    </select>
                    <a
                      href="#"
                      className="create-batch-link text-emerald"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsModalOpen(true);
                      }}
                    >
                      Create new batch
                    </a>
                  </div>
                </div>
              </div>
            ))}

            <div className="text-center mt-4">
              <button className="btn btn-emerald enroll-btn px-5" onClick={handleEnroll}>
                Enroll Student
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: BULK MULTI-SELECT */}
        {activeTab === "bulk" && (
          <div className="tab-pane-content">
            <h3 className="pane-title mb-3">Bulk Multi-Select Enrollment</h3>
            
            {/* Batch Info */}
            <div className="section-block mb-4">
              <label className="section-label">Select Target Batch</label>
              <select
                className="input-select"
                value={bulkBatchId}
                onChange={(e) => setBulkBatchId(e.target.value)}
              >
                <option value="">Choose batch...</option>
                {batchesList.map((b) => (
                  <option key={b._id} value={b._id}>{b.name} ({b.course?.courseName || "No course"})</option>
                ))}
              </select>
            </div>

            {/* List Filters */}
            <div className="list-filters-row d-flex gap-3 mb-3">
              <input
                type="text"
                placeholder="Search student by name or email..."
                value={bulkSearch}
                onChange={(e) => setBulkSearch(e.target.value)}
                className="glass-input flex-grow-1"
              />
              <select
                value={bulkFilterStatus}
                onChange={(e) => setBulkFilterStatus(e.target.value)}
                className="glass-input"
              >
                <option value="all">All Registrations</option>
                <option value="active">Active Accounts Only</option>
                <option value="pending">Pending CRM Synced Leads</option>
              </select>
            </div>

            {/* Students Checkbox Box */}
            <div className="bulk-selection-list">
              {getFilteredBulkList().length > 0 ? (
                getFilteredBulkList().map((s) => {
                  const isChecked = s.isPending 
                    ? selectedPendingIds.includes(s._id) 
                    : selectedActiveIds.includes(s._id);
                  
                  return (
                    <div 
                      key={s._id} 
                      className={`student-select-row ${isChecked ? "selected" : ""}`}
                      onClick={() => s.isPending ? togglePendingSelect(s._id) : toggleActiveSelect(s._id)}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by click listener on parent
                        className="student-checkbox"
                      />
                      <div className="student-info">
                        <strong>{s.name || "Sync Lead"}</strong>
                        <span>{s.email}</span>
                      </div>
                      <span className={`status-pill ${s.isPending ? "pending" : "active"}`}>
                        {s.isPending ? "Zen CRM Sync" : "Active"}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-5 text-secondary">No matching student accounts found.</div>
              )}
            </div>

            <div className="selection-summary mt-3 d-flex justify-content-between align-items-center">
              <span className="text-secondary">
                Selected: <strong>{selectedActiveIds.length}</strong> active, <strong>{selectedPendingIds.length}</strong> pending leads
              </span>
              <button 
                onClick={handleBulkEnroll}
                className="btn btn-emerald"
                disabled={selectedActiveIds.length === 0 && selectedPendingIds.length === 0}
              >
                Enroll Selected Students
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: CSV IMPORT */}
        {activeTab === "csv" && (
          <div className="tab-pane-content">
            <h3 className="pane-title mb-3">Bulk Enrollment via CSV File</h3>

            {/* Batch Select */}
            <div className="section-block mb-4">
              <label className="section-label">Select Target Batch</label>
              <select
                className="input-select"
                value={csvBatchId}
                onChange={(e) => setCsvBatchId(e.target.value)}
              >
                <option value="">Choose batch...</option>
                {batchesList.map((b) => (
                  <option key={b._id} value={b._id}>{b.name} ({b.course?.courseName || "No course"})</option>
                ))}
              </select>
            </div>

            {/* CSV Uploader */}
            <div className="csv-upload-dropzone mb-4">
              <i className="bi bi-file-earmark-spreadsheet text-emerald"></i>
              <h4>Upload CSV Student Registry</h4>
              <p className="text-secondary">Provide a CSV file containing a list of student emails</p>
              
              <label htmlFor="csv-file-input" className="btn btn-outline-emerald mt-2">
                {csvFileName ? "Choose Different File" : "Select CSV File"}
              </label>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                style={{ display: "none" }}
              />
              
              {csvFileName && (
                <div className="mt-3 file-loaded-badge">
                  <i className="bi bi-check-circle-fill"></i> Loaded: <strong>{csvFileName}</strong>
                </div>
              )}
            </div>

            {/* Parsed Output Preview */}
            {parsedEmails.length > 0 && (
              <div className="parsed-emails-preview mb-4">
                <h5>Emails Parsed for Import ({parsedEmails.length}):</h5>
                <div className="email-chips-container">
                  {parsedEmails.map((email, idx) => (
                    <span key={idx} className="email-chip">
                      {email}
                    </span>
                  ))}
                </div>

                <div className="text-end mt-3">
                  <button 
                    onClick={handleCSVEnroll}
                    className="btn btn-emerald px-4"
                  >
                    Import & Enroll Students
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateBatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        coursesList={coursesList}
        weekDays={weekDays}
      />
    </div>
  );
};

export default EnrollStudents;
