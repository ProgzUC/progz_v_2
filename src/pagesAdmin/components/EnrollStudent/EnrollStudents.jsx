import React, { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./EnrollStudents.css";

import { useAllUsers, usePendingUsers } from "../../../hooks/useAdminUsers";
import { useCourses } from "../../../hooks/useCourses";
import { useBatches, useEnrollStudent, useBulkEnrollStudents } from "../../../hooks/useBatches";
import Swal from "sweetalert2";
import Loader from "../../../components/common/Loader/Loader";
import { createId } from "../../../utils/courseBuilder";
import { parseEmailsFromCsv, downloadEnrollmentCsvTemplate } from "../../../utils/csvImport";

import CreateBatchModal from "./CreateBatchModal";

const VALID_TABS = new Set(["single", "bulk", "csv"]);

const AVATAR_TONES = ["green", "blue", "orange", "purple", "teal", "rose"];

const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
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

const EnrollStudents = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useAllUsers();
  const { data: pendingUsers, isLoading: pendingLoading, refetch: refetchPending } = usePendingUsers();
  const { data: coursesData, isLoading: coursesLoading } = useCourses();
  const { data: batchesData, isLoading: batchesLoading, refetch: refetchBatches } = useBatches();

  const { mutateAsync: enrollStudentMutation } = useEnrollStudent();
  const { mutateAsync: bulkEnrollMutation } = useBulkEnrollStudents();

  const tabParam = searchParams.get("tab");
  const batchParam = searchParams.get("batchId") || "";
  const activeTab = VALID_TABS.has(tabParam) ? tabParam : "single";

  const setActiveTab = (tab) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next, { replace: true });
  };

  const usersArray = Array.isArray(users) ? users : [];
  const studentsList = usersArray.filter((u) => (u.role || "").toLowerCase() === "student");
  const pendingStudentsList = (Array.isArray(pendingUsers) ? pendingUsers : []).filter(
    (u) => (u.role || "").toLowerCase() === "student"
  );

  const instructorsList = usersArray.filter(
    (u) =>
      (u.role || "").toLowerCase() === "trainer" ||
      (u.role || "").toLowerCase() === "instructor"
  );
  const coursesList = coursesData || [];
  const batchesList = batchesData || [];

  const [selectedStudent, setSelectedStudent] = useState("");
  const [courseSections, setCourseSections] = useState([
    { id: createId(), courseId: "", instructorId: "", batchId: "" },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSingleEnrolling, setIsSingleEnrolling] = useState(false);

  const [bulkBatchId, setBulkBatchId] = useState(batchParam);
  const [selectedActiveIds, setSelectedActiveIds] = useState(() => new Set());
  const [selectedPendingIds, setSelectedPendingIds] = useState(() => new Set());
  const [bulkSearch, setBulkSearch] = useState("");
  const [bulkFilterStatus, setBulkFilterStatus] = useState("all");
  const [hideAlreadyEnrolled, setHideAlreadyEnrolled] = useState(true);

  const [csvBatchId, setCsvBatchId] = useState(batchParam);
  const [parsedEmails, setParsedEmails] = useState([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [isParsing, setIsParsing] = useState(false);

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    if (!batchParam) return;
    setBulkBatchId(batchParam);
    setCsvBatchId(batchParam);
  }, [batchParam]);

  const selectedBulkBatch = useMemo(
    () => batchesList.find((b) => String(b._id) === String(bulkBatchId)),
    [batchesList, bulkBatchId]
  );

  const enrolledInBulkBatch = useMemo(() => {
    const ids = new Set();
    (selectedBulkBatch?.students || []).forEach((s) => {
      ids.add(String(s._id || s));
    });
    return ids;
  }, [selectedBulkBatch]);

  const handleRefreshData = () => {
    refetchUsers();
    refetchPending();
    refetchBatches();
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const uniqueEmails = parseEmailsFromCsv(event.target.result);
        setParsedEmails(uniqueEmails);

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: uniqueEmails.length ? "success" : "warning",
          title: uniqueEmails.length
            ? `Parsed ${uniqueEmails.length} unique emails from CSV`
            : "No valid emails found in CSV",
          showConfirmButton: false,
          timer: 3000,
        });
      } catch {
        Swal.fire("Error", "Failed to parse CSV file. Ensure standard CSV format.", "error");
      } finally {
        setIsParsing(false);
      }
    };
    reader.onerror = () => {
      setIsParsing(false);
      Swal.fire("Error", "Could not read the selected file.", "error");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const updateSection = (id, field, value) => {
    setCourseSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, [field]: value } : sec))
    );
  };

  const addCourse = () => {
    setCourseSections([
      ...courseSections,
      { id: createId(), courseId: "", instructorId: "", batchId: "" },
    ]);
  };

  const deleteCourse = (id) => {
    if (courseSections.length > 1) {
      setCourseSections(courseSections.filter((sec) => sec.id !== id));
    }
  };

  const handleEnroll = async () => {
    if (!selectedStudent) {
      Swal.fire("Error", "Please select a student", "error");
      return;
    }

    const validSections = courseSections.filter((s) => s.courseId && s.batchId);
    if (validSections.length === 0) {
      Swal.fire("Error", "Please select at least one Course and Batch", "error");
      return;
    }

    setIsSingleEnrolling(true);
    try {
      for (const section of validSections) {
        await enrollStudentMutation({
          batchId: section.batchId,
          studentId: selectedStudent,
          instructorId: section.instructorId || undefined,
        });
      }
      Swal.fire("Success", "Student enrolled successfully!", "success");
      setSelectedStudent("");
      setCourseSections([{ id: createId(), courseId: "", instructorId: "", batchId: "" }]);
      handleRefreshData();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.msg || err.response?.data?.message || "Enrollment failed",
        "error"
      );
    } finally {
      setIsSingleEnrolling(false);
    }
  };

  const handleBulkEnroll = async () => {
    if (!bulkBatchId) {
      Swal.fire("Warning", "Please select a target batch first.", "warning");
      return;
    }

    if (selectedActiveIds.size === 0 && selectedPendingIds.size === 0) {
      Swal.fire("Warning", "No students selected. Tick checkboxes next to the names.", "warning");
      return;
    }

    const confirm = await Swal.fire({
      title: "Enroll selected students?",
      html: `<p>${selectedActiveIds.size} active + ${selectedPendingIds.size} Zen CRM pending will be enrolled into <strong>${selectedBulkBatch?.name || "batch"}</strong>.</p>
             <p class="text-secondary" style="font-size:0.85rem">Pending CRM leads are auto-approved on enroll.</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      confirmButtonText: "Yes, enroll",
    });
    if (!confirm.isConfirmed) return;

    Swal.fire({
      title: "Enrolling Students",
      text: "Adding selected students and auto-approving any pending CRM leads...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await bulkEnrollMutation({
        batchId: bulkBatchId,
        studentIds: Array.from(selectedActiveIds),
        pendingStudentIds: Array.from(selectedPendingIds),
      });

      let html = `Successfully enrolled: <strong>${response.enrolledCount}</strong> students.<br/>Approved pending leads: <strong>${response.approvedCount}</strong>.`;
      if (response.errors?.length) {
        html += `<br/><br/><div style="text-align:left;font-size:12px;color:#ef4444;max-height:100px;overflow-y:auto"><strong>Notes:</strong><br/>${response.errors.map((e) => `• ${e}`).join("<br/>")}</div>`;
      }

      Swal.fire({
        title: "Bulk Enrollment Complete",
        html,
        icon: response.errors?.length ? "info" : "success",
      });

      setSelectedActiveIds(new Set());
      setSelectedPendingIds(new Set());
      handleRefreshData();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.msg ||
          err.response?.data?.message ||
          err.message ||
          "Failed to process bulk enrollment",
        "error"
      );
    }
  };

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
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await bulkEnrollMutation({
        batchId: csvBatchId,
        emails: parsedEmails,
      });

      let alertText = `Successfully enrolled: <strong>${response.enrolledCount}</strong> students.<br/>Approved pending CRM profiles: <strong>${response.approvedCount}</strong>.`;

      if (response.errors?.length > 0) {
        alertText += `<br/><br/><div style="text-align:left; font-size:12px; color:#ef4444; max-height:100px; overflow-y:auto;"><strong>Skipped / Failed:</strong><br/>${response.errors.map((e) => `• ${e}`).join("<br/>")}</div>`;
      }

      Swal.fire({
        title: "CSV Enrollment Run",
        html: alertText,
        icon: response.errors?.length > 0 ? "info" : "success",
      });

      setParsedEmails([]);
      setCsvFileName("");
      handleRefreshData();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.msg ||
          err.response?.data?.message ||
          err.message ||
          "Failed to import CSV",
        "error"
      );
    }
  };

  const toggleActiveSelect = (id) => {
    setSelectedActiveIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePendingSelect = (id) => {
    setSelectedPendingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getFilteredBulkList = () => {
    let list = [];
    if (bulkFilterStatus === "all" || bulkFilterStatus === "active") {
      list.push(...studentsList.map((s) => ({ ...s, isPending: false })));
    }
    if (bulkFilterStatus === "all" || bulkFilterStatus === "pending") {
      list.push(...pendingStudentsList.map((s) => ({ ...s, isPending: true })));
    }

    if (hideAlreadyEnrolled && bulkBatchId) {
      list = list.filter((s) => s.isPending || !enrolledInBulkBatch.has(String(s._id)));
    }

    if (bulkSearch) {
      const query = bulkSearch.toLowerCase();
      list = list.filter(
        (s) =>
          (s.name || "").toLowerCase().includes(query) ||
          (s.email || "").toLowerCase().includes(query) ||
          (s.zenCourseName || "").toLowerCase().includes(query)
      );
    }
    return list;
  };

  const filteredBulkList = getFilteredBulkList();

  const visibleActiveIds = filteredBulkList.filter((s) => !s.isPending).map((s) => s._id);
  const visiblePendingIds = filteredBulkList.filter((s) => s.isPending).map((s) => s._id);
  const allVisibleSelected =
    filteredBulkList.length > 0 &&
    visibleActiveIds.every((id) => selectedActiveIds.has(id)) &&
    visiblePendingIds.every((id) => selectedPendingIds.has(id));

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedActiveIds((prev) => {
        const next = new Set(prev);
        visibleActiveIds.forEach((id) => next.delete(id));
        return next;
      });
      setSelectedPendingIds((prev) => {
        const next = new Set(prev);
        visiblePendingIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedActiveIds((prev) => {
        const next = new Set(prev);
        visibleActiveIds.forEach((id) => next.add(id));
        return next;
      });
      setSelectedPendingIds((prev) => {
        const next = new Set(prev);
        visiblePendingIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const clearBulkSelection = () => {
    setSelectedActiveIds(new Set());
    setSelectedPendingIds(new Set());
  };

  const paneTitles = {
    single: "Individual enrollment",
    bulk: "Bulk multi-select",
    csv: "CSV import",
  };

  if (usersLoading || pendingLoading || coursesLoading || batchesLoading) {
    return (
      <div className="admin-enroll-students-page">
        <Loader />
      </div>
    );
  }

  return (
    <div className="admin-enroll-students-page">
      <header className="page-hero">
        <h1 className="page-title">Student course enrollment</h1>
        <p className="page-subtitle">
          Enroll individuals, multi-select students, or import emails via CSV.
        </p>
      </header>

      <div className="top-row">
        <div className="search-actions">
          <div className="tab-pills" role="tablist" aria-label="Enrollment mode">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "single"}
              className={`tab-pill ${activeTab === "single" ? "active" : ""}`}
              onClick={() => setActiveTab("single")}
            >
              Single user
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "bulk"}
              className={`tab-pill ${activeTab === "bulk" ? "active" : ""}`}
              onClick={() => setActiveTab("bulk")}
            >
              Bulk select
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "csv"}
              className={`tab-pill ${activeTab === "csv" ? "active" : ""}`}
              onClick={() => setActiveTab("csv")}
            >
              CSV import
            </button>
          </div>
        </div>
      </div>

      {pendingStudentsList.length > 0 && activeTab !== "single" && (
        <div className="zen-crm-banner">
          <i className="bi bi-cloud-download" aria-hidden="true"></i>
          <div>
            <strong>{pendingStudentsList.length} Zen CRM synced lead(s)</strong> awaiting
            enrollment. Pending students are auto-approved when enrolled here.{" "}
            <Link to="/admin/approve-users">Review in Approve Users</Link>
          </div>
        </div>
      )}

      <div className="content-card">
        <div className="card-title-row">
          <h2 className="card-title">{paneTitles[activeTab]}</h2>
        </div>

        {activeTab === "single" && (
          <div className="tab-pane-content">
            <div className="section-block">
              <label className="section-label" htmlFor="enroll-student-select">
                Select student profile
              </label>
              <select
                id="enroll-student-select"
                className="input-select"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="">Select student</option>
                {studentsList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            </div>

            {courseSections.map((section, idx) => (
              <div key={section.id} className="section-block">
                <div className="title-row">
                  <h3 className="section-title">Course session – {idx + 1}</h3>
                  <div className="title-buttons">
                    {idx === 0 && (
                      <button type="button" className="btn-outline" onClick={addCourse}>
                        + Add another course
                      </button>
                    )}
                    {idx !== 0 && (
                      <button
                        type="button"
                        className="btn-outline-danger"
                        onClick={() => deleteCourse(section.id)}
                        title="Delete course section"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid-select-group">
                  <div className="field-group">
                    <label className="section-label">Course</label>
                    <select
                      className="input-select"
                      value={section.courseId}
                      onChange={(e) => updateSection(section.id, "courseId", e.target.value)}
                    >
                      <option value="">Select course</option>
                      {coursesList.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.courseName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field-group">
                    <label className="section-label">Instructor</label>
                    <select
                      className="input-select"
                      value={section.instructorId}
                      onChange={(e) => updateSection(section.id, "instructorId", e.target.value)}
                    >
                      <option value="">Select instructor</option>
                      {instructorsList.map((ins) => (
                        <option key={ins._id} value={ins._id}>
                          {ins.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="batch-select-box">
                    <label className="section-label">Batch</label>
                    <select
                      className="input-select"
                      value={section.batchId}
                      onChange={(e) => updateSection(section.id, "batchId", e.target.value)}
                    >
                      <option value="">Select batch</option>
                      {batchesList
                        .filter((b) => {
                          if (!section.courseId) return true;
                          const ids =
                            Array.isArray(b.courses) && b.courses.length
                              ? b.courses.map((c) => String(c?._id || c))
                              : [String(b.course?._id || b.course)].filter(Boolean);
                          return ids.includes(String(section.courseId));
                        })
                        .map((b) => (
                          <option key={b._id} value={b._id}>
                            {b.name}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      className="create-batch-link"
                      onClick={() => setIsModalOpen(true)}
                    >
                      Create new batch
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="enroll-actions">
              <button
                type="button"
                className="create-btn"
                onClick={handleEnroll}
                disabled={isSingleEnrolling}
              >
                {isSingleEnrolling ? "Enrolling..." : "Enroll student"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "bulk" && (
          <div className="tab-pane-content">
            <div className="section-block">
              <label className="section-label" htmlFor="bulk-batch-select">
                Select target batch
              </label>
              <select
                id="bulk-batch-select"
                className="input-select"
                value={bulkBatchId}
                onChange={(e) => {
                  setBulkBatchId(e.target.value);
                  const next = new URLSearchParams(searchParams);
                  next.set("tab", "bulk");
                  if (e.target.value) next.set("batchId", e.target.value);
                  else next.delete("batchId");
                  setSearchParams(next, { replace: true });
                }}
              >
                <option value="">Choose batch...</option>
                {batchesList.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.course?.courseName || "No course"})
                  </option>
                ))}
              </select>
            </div>

            <div className="list-filters-row">
              <div className="search-box">
                <i className="bi bi-search" aria-hidden="true"></i>
                <input
                  type="text"
                  placeholder="Search by name, email, or Zen course"
                  value={bulkSearch}
                  onChange={(e) => setBulkSearch(e.target.value)}
                  aria-label="Search students"
                />
              </div>
              <div className="status-filter">
                <i className="bi bi-funnel filter-icon" aria-hidden="true"></i>
                <select
                  value={bulkFilterStatus}
                  onChange={(e) => setBulkFilterStatus(e.target.value)}
                  aria-label="Filter by registration status"
                >
                  <option value="all">All registrations</option>
                  <option value="active">Active accounts only</option>
                  <option value="pending">Pending CRM synced leads</option>
                </select>
                <i className="bi bi-chevron-down filter-chevron" aria-hidden="true"></i>
              </div>
              <label className="hide-enrolled-toggle">
                <input
                  type="checkbox"
                  checked={hideAlreadyEnrolled}
                  onChange={(e) => setHideAlreadyEnrolled(e.target.checked)}
                />
                Hide already in batch
              </label>
            </div>

            <div className="bulk-list-toolbar">
              <label className="select-all-label">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  disabled={filteredBulkList.length === 0}
                />
                Select all visible ({filteredBulkList.length})
              </label>
              {(selectedActiveIds.size > 0 || selectedPendingIds.size > 0) && (
                <button type="button" className="clear-btn" onClick={clearBulkSelection}>
                  Clear selection
                </button>
              )}
            </div>

            <div className="bulk-selection-list">
              {filteredBulkList.length > 0 ? (
                filteredBulkList.map((s) => {
                  const isChecked = s.isPending
                    ? selectedPendingIds.has(s._id)
                    : selectedActiveIds.has(s._id);
                  const name = s.name || "Sync Lead";

                  return (
                    <div
                      key={`${s.isPending ? "p" : "a"}-${s._id}`}
                      className={`student-select-row ${isChecked ? "selected" : ""}`}
                      onClick={() =>
                        s.isPending ? togglePendingSelect(s._id) : toggleActiveSelect(s._id)
                      }
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="student-checkbox"
                        aria-label={`Select ${name}`}
                      />
                      <span
                        className={`person-avatar tone-${toneForName(name)}`}
                        aria-hidden="true"
                      >
                        {getInitials(name)}
                      </span>
                      <div className="student-info">
                        <strong>{name}</strong>
                        <span>{s.email}</span>
                        {s.zenCourseName && (
                          <span className="zen-course-hint">Zen: {s.zenCourseName}</span>
                        )}
                      </div>
                      <span className={`status-pill ${s.isPending ? "pending" : "active"}`}>
                        {s.isPending ? "Zen CRM Sync" : "Active"}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="empty-bulk">No matching student accounts found.</div>
              )}
            </div>

            <div className="selection-summary">
              <span className="summary-text">
                Selected: <strong>{selectedActiveIds.size}</strong> active,{" "}
                <strong>{selectedPendingIds.size}</strong> pending leads
              </span>
              <button
                type="button"
                onClick={handleBulkEnroll}
                className="create-btn"
                disabled={selectedActiveIds.size === 0 && selectedPendingIds.size === 0}
              >
                Enroll selected students
              </button>
            </div>
          </div>
        )}

        {activeTab === "csv" && (
          <div className="tab-pane-content">
            <div className="section-block">
              <label className="section-label" htmlFor="csv-batch-select">
                Select target batch
              </label>
              <select
                id="csv-batch-select"
                className="input-select"
                value={csvBatchId}
                onChange={(e) => {
                  setCsvBatchId(e.target.value);
                  const next = new URLSearchParams(searchParams);
                  next.set("tab", "csv");
                  if (e.target.value) next.set("batchId", e.target.value);
                  else next.delete("batchId");
                  setSearchParams(next, { replace: true });
                }}
              >
                <option value="">Choose batch...</option>
                {batchesList.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.course?.courseName || "No course"})
                  </option>
                ))}
              </select>
            </div>

            <div className="csv-upload-dropzone">
              <i className="bi bi-file-earmark-spreadsheet" aria-hidden="true"></i>
              <h3>Upload CSV student registry</h3>
              <p>
                Include an <code>email</code> column (recommended). Matching active users and Zen
                CRM pending leads are enrolled; unknown emails are skipped.
              </p>

              <div className="csv-actions">
                <label htmlFor="csv-file-input" className="btn-outline">
                  {isParsing
                    ? "Parsing..."
                    : csvFileName
                      ? "Choose different file"
                      : "Select CSV file"}
                </label>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={downloadEnrollmentCsvTemplate}
                >
                  Download template
                </button>
              </div>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv,text/csv"
                onChange={handleCSVUpload}
                className="sr-only"
              />

              {csvFileName && (
                <div className="file-loaded-badge">
                  <i className="bi bi-check-circle-fill" aria-hidden="true"></i> Loaded:{" "}
                  <strong>{csvFileName}</strong>
                </div>
              )}
            </div>

            {parsedEmails.length > 0 && (
              <div className="parsed-emails-preview">
                <h4>Emails parsed for import ({parsedEmails.length})</h4>
                <div className="email-chips-container">
                  {parsedEmails.map((email) => (
                    <span key={email} className="email-chip">
                      {email}
                    </span>
                  ))}
                </div>

                <div className="enroll-actions">
                  <button type="button" onClick={handleCSVEnroll} className="create-btn">
                    Import & enroll students
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
