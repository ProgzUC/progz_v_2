import React, { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./EnrollStudents.css";

import { useAllUsers, usePendingUsers } from "../../../hooks/useAdminUsers";
import { useCourses } from "../../../hooks/useCourses";
import { useBatches, useEnrollStudent, useBulkEnrollStudents } from "../../../hooks/useBatches";
import Swal from "sweetalert2";
import Loader from "../../../components/common/Loader/Loader";
import AppSelect from "../../../components/common/AppSelect/AppSelect";
import { createId } from "../../../utils/courseBuilder";
import BulkStudentImport from "../BulkImport/BulkStudentImport";

import CreateBatchModal from "./CreateBatchModal";

/** `csv` kept as alias → import for old deep links */
const VALID_TABS = new Set(["single", "bulk", "import", "csv"]);

const resolveTab = (tabParam) => {
  if (tabParam === "csv") return "import";
  return VALID_TABS.has(tabParam) ? tabParam : "single";
};

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
  const activeTab = resolveTab(tabParam);

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
  const [importBatchId, setImportBatchId] = useState(batchParam);

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    if (!batchParam) return;
    setBulkBatchId(batchParam);
    setImportBatchId(batchParam);
  }, [batchParam]);

  useEffect(() => {
    if (tabParam === "csv") {
      const next = new URLSearchParams(searchParams);
      next.set("tab", "import");
      setSearchParams(next, { replace: true });
    }
  }, [tabParam, searchParams, setSearchParams]);

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
      confirmButtonColor: "#10A879",
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
    import: "Import & invite",
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
          Enroll existing students, or import a college email list to create accounts and send
          passwordless login links.
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
              aria-selected={activeTab === "import"}
              className={`tab-pill ${activeTab === "import" ? "active" : ""}`}
              onClick={() => setActiveTab("import")}
            >
              Import & invite
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
              <AppSelect
                id="enroll-student-select"
                className="input-select"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                aria-label="Select student profile"
                options={[
                  { value: "", label: "Select student" },
                  ...studentsList.map((s) => ({
                    value: s._id,
                    label: `${s.name} (${s.email})`,
                  })),
                ]}
              />
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
                    <AppSelect
                      className="input-select"
                      value={section.courseId}
                      onChange={(e) => updateSection(section.id, "courseId", e.target.value)}
                      aria-label="Select course"
                      options={[
                        { value: "", label: "Select course" },
                        ...coursesList.map((c) => ({
                          value: c._id,
                          label: c.courseName,
                        })),
                      ]}
                    />
                  </div>

                  <div className="field-group">
                    <label className="section-label">Instructor</label>
                    <AppSelect
                      className="input-select"
                      value={section.instructorId}
                      onChange={(e) => updateSection(section.id, "instructorId", e.target.value)}
                      aria-label="Select instructor"
                      options={[
                        { value: "", label: "Select instructor" },
                        ...instructorsList.map((ins) => ({
                          value: ins._id,
                          label: ins.name,
                        })),
                      ]}
                    />
                  </div>

                  <div className="batch-select-box">
                    <label className="section-label">Batch</label>
                    <AppSelect
                      className="input-select"
                      value={section.batchId}
                      onChange={(e) => updateSection(section.id, "batchId", e.target.value)}
                      aria-label="Select batch"
                      options={[
                        { value: "", label: "Select batch" },
                        ...batchesList
                          .filter((b) => {
                            if (!section.courseId) return true;
                            const ids =
                              Array.isArray(b.courses) && b.courses.length
                                ? b.courses.map((c) => String(c?._id || c))
                                : [String(b.course?._id || b.course)].filter(Boolean);
                            return ids.includes(String(section.courseId));
                          })
                          .map((b) => ({
                            value: b._id,
                            label: b.name,
                          })),
                      ]}
                    />
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
              <AppSelect
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
                aria-label="Select target batch"
                options={[
                  { value: "", label: "Choose batch..." },
                  ...batchesList.map((b) => ({
                    value: b._id,
                    label: `${b.name} (${b.course?.courseName || "No course"})`,
                  })),
                ]}
              />
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
                <AppSelect
                  icon="bi-funnel"
                  value={bulkFilterStatus}
                  onChange={(e) => setBulkFilterStatus(e.target.value)}
                  aria-label="Filter by registration status"
                  options={[
                    { value: "all", label: "All registrations" },
                    { value: "active", label: "Active accounts only" },
                    { value: "pending", label: "Pending CRM synced leads" },
                  ]}
                />
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
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          s.isPending ? togglePendingSelect(s._id) : toggleActiveSelect(s._id)
                        }
                        className="student-checkbox"
                        aria-label={`Select ${name}`}
                      />
                      <span
                        className={`person-avatar tone-${toneForName(name)}`}
                        aria-hidden="true"
                      >
                        {getInitials(name)}
                      </span>
                      <div
                        className="student-info student-info--selectable"
                        onDoubleClick={() =>
                          s.isPending ? togglePendingSelect(s._id) : toggleActiveSelect(s._id)
                        }
                        title="Double-click name to select"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            s.isPending ? togglePendingSelect(s._id) : toggleActiveSelect(s._id);
                          }
                        }}
                      >
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

        {activeTab === "import" && (
          <div className="tab-pane-content">
            <p className="import-tab-hint">
              For college lists: create student accounts, assign to a batch, and email a secure
              login link. Existing emails are assigned without creating duplicates.
            </p>
            <BulkStudentImport
              embedded
              batchId={importBatchId}
              onBatchIdChange={(id) => {
                setImportBatchId(id);
                const next = new URLSearchParams(searchParams);
                next.set("tab", "import");
                if (id) next.set("batchId", id);
                else next.delete("batchId");
                setSearchParams(next, { replace: true });
              }}
            />
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
