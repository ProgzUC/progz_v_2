import React, { useMemo, useState, useRef, useEffect } from "react";
import "./CourseTrainers.css";
import { useParams, useNavigate } from "react-router-dom";
import {
  LuUsers,
  LuGraduationCap,
  LuX,
  LuPlus,
  LuSearch,
  LuMail,
  LuPencil,
  LuTrash2,
  LuEllipsisVertical,
  LuInfo,
  LuEye,
} from "react-icons/lu";

import { useCourse, useUpdateCourse } from "../../../hooks/useCourses";
import { useAllUsers } from "../../../hooks/useAdminUsers";
import Loader from "../../../components/common/Loader/Loader";
import AppSelect from "../../../components/common/AppSelect/AppSelect";
import StudentCombobox from "../Batches/StudentCombobox";
import { confirmAction } from "../../../utils/confirmAction";

import { showError, showSuccess, showWarning } from "../../../utils/toast";

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const CourseTrainers = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: course, isLoading: isCourseLoading } = useCourse(id);
  const { data: allUsers, isLoading: isUsersLoading } = useAllUsers();
  const { mutate: updateCourseMutation } = useUpdateCourse();

  const [activeTab, setActiveTab] = useState("list"); // list | add
  const [listSearch, setListSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [selectedInstructorId, setSelectedInstructorId] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const isLoading = isCourseLoading || isUsersLoading;
  const currentInstructors = course?.instructor || [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableInstructors = useMemo(() => {
    return (allUsers || []).filter((user) => {
      const isAlreadyAssigned = currentInstructors.some((inst) => inst._id === user._id);
      const role = (user.role || "").toLowerCase();
      const isInstructor = role === "trainer" || role === "instructor";
      return !isAlreadyAssigned && isInstructor;
    });
  }, [allUsers, currentInstructors]);

  const displayedInstructors = useMemo(() => {
    const term = listSearch.toLowerCase().trim();
    let list = [...currentInstructors];

    if (term) {
      list = list.filter(
        (inst) =>
          (inst.name || "").toLowerCase().includes(term) ||
          (inst.email || "").toLowerCase().includes(term)
      );
    }

    if (sortBy === "name") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "latest") {
      // Assigned list grows by append — newest is last, so reverse for latest-first
      list = list.reverse();
    }
    // "oldest" keeps API / assignment order

    return list;
  }, [currentInstructors, listSearch, sortBy]);

  const handleClose = () => navigate(-1);

  const handleUpdateInstructors = (newInstructorList) => {
    setIsUpdating(true);
    const instructorIds = newInstructorList.map((inst) => inst._id);

    const payload = {
      ...course,
      instructor: instructorIds,
      courseName: course.courseName,
      courseId: course.courseId,
      courseDescription: course.courseDescription,
      courseDuration: course.courseDuration,
      courseDurationMonths: course.courseDurationMonths,
      thumbnail: course.thumbnail,
      modules: course.modules,
    };

    updateCourseMutation(
      { id, data: payload },
      {
        onSuccess: () => {
          showSuccess("Updated: Instructors list updated successfully!");
          setIsUpdating(false);
          setSelectedInstructorId("");
          setActiveTab("list");
        },
        onError: (err) => {
          showError(err.message || "Failed to update instructors");
          setIsUpdating(false);
        },
      }
    );
  };

  const handleAddInstructor = () => {
    if (!selectedInstructorId) {
      showWarning("Please select an instructor from the list first.");
      return;
    }
    const user = allUsers.find((u) => u._id === selectedInstructorId);
    if (!user) return;
    handleUpdateInstructors([...currentInstructors, user]);
  };

  const handleRemoveInstructor = async (instructor) => {
    setOpenMenuId(null);
    const ok = await confirmAction({
      title: "Remove Instructor?",
      text: `Remove ${instructor.name} from this course?`,
      icon: "warning",
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Remove",
    });
    if (!ok) return;
    const newList = currentInstructors.filter((inst) => inst._id !== instructor._id);
    handleUpdateInstructors(newList);
  };

  const handleEditInstructor = (instructor) => {
    setOpenMenuId(null);
    navigate("/admin/instructor-preview", {
      state: { instructor, initialEditMode: true },
    });
  };

  const handleViewInstructor = (instructor) => {
    setOpenMenuId(null);
    navigate("/admin/instructor-preview", {
      state: { instructor, initialEditMode: false },
    });
  };

  if (isLoading) {
    return (
      <div className="mi-overlay">
        <Loader />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mi-overlay">
        <div className="mi-modal mi-modal--error">
          <p>Course not found</p>
          <button type="button" className="mi-btn mi-btn--ghost" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mi-overlay" role="dialog" aria-modal="true" aria-labelledby="mi-title">
      <div className={`mi-modal ${isUpdating ? "mi-modal--busy" : ""}`}>
        {isUpdating && (
          <div className="mi-updating" aria-live="polite">
            Updating…
          </div>
        )}

        <header className="mi-header">
          <div className="mi-header-left">
            <div className="mi-header-icon" aria-hidden="true">
              <LuUsers />
            </div>
            <div>
              <h2 id="mi-title" className="mi-title">
                Manage Instructors
              </h2>
              <p className="mi-subtitle">
                Add new instructors or manage the existing ones for this course.
              </p>
            </div>
          </div>

          <div className="mi-header-right">
            <span className="mi-course-badge" title={course.courseName}>
              <LuGraduationCap aria-hidden="true" />
              <span>{course.courseName}</span>
            </span>
            <button
              type="button"
              className="mi-close-icon"
              onClick={handleClose}
              aria-label="Close"
            >
              <LuX />
            </button>
          </div>
        </header>

        <nav className="mi-tabs" aria-label="Instructor sections">
          <button
            type="button"
            className={`mi-tab ${activeTab === "list" ? "is-active" : ""}`}
            onClick={() => setActiveTab("list")}
          >
            <LuUsers aria-hidden="true" />
            Instructors
          </button>
          <button
            type="button"
            className={`mi-tab ${activeTab === "add" ? "is-active" : ""}`}
            onClick={() => setActiveTab("add")}
          >
            <LuPlus aria-hidden="true" />
            Add New Instructor
          </button>
        </nav>

        {activeTab === "list" ? (
          <div className="mi-body">
            <div className="mi-toolbar">
              <div className="mi-search">
                <LuSearch className="mi-search-icon" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                  aria-label="Search instructors"
                />
              </div>
              <button
                type="button"
                className="mi-btn mi-btn--primary"
                onClick={() => setActiveTab("add")}
              >
                <LuPlus aria-hidden="true" />
                Add Instructor
              </button>
            </div>

            <div className="mi-list-meta">
              <span>
                {displayedInstructors.length} Instructor
                {displayedInstructors.length !== 1 ? "s" : ""}
              </span>
              <label className="mi-sort">
                Sort by:
                <AppSelect
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort instructors"
                  options={[
                    { value: "latest", label: "Latest added" },
                    { value: "oldest", label: "Oldest first" },
                    { value: "name", label: "Name A–Z" },
                  ]}
                />
              </label>
            </div>

            {displayedInstructors.length === 0 ? (
              <div className="mi-empty">
                {currentInstructors.length === 0
                  ? "No instructors assigned to this course yet."
                  : "No instructors match your search."}
              </div>
            ) : (
              <ul className="mi-instructor-list">
                {displayedInstructors.map((inst, idx) => {
                  const name = inst.name || "Unknown";
                  const email = inst.email || "—";
                  const initials = getInitials(name);
                  const showInitials = Boolean(inst.name);

                  return (
                    <li key={inst._id || idx} className="mi-instructor-card">
                      <div className="mi-instructor-main">
                        <div
                          className={`mi-avatar ${showInitials ? "mi-avatar--initials" : ""}`}
                          aria-hidden="true"
                        >
                          {showInitials ? initials : <LuUsers />}
                        </div>
                        <div className="mi-instructor-info">
                          <div className="mi-instructor-top">
                            <span className="mi-instructor-name">{name}</span>
                            <span className="mi-status">
                              <span className="mi-status-dot" />
                              Active
                            </span>
                          </div>
                          <span className="mi-instructor-email">
                            <LuMail aria-hidden="true" />
                            {email}
                          </span>
                        </div>
                      </div>

                      <div className="mi-instructor-actions">
                        <button
                          type="button"
                          className="mi-btn mi-btn--edit"
                          onClick={() => handleEditInstructor(inst)}
                          disabled={isUpdating}
                        >
                          <LuPencil aria-hidden="true" />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="mi-btn mi-btn--remove"
                          onClick={() => handleRemoveInstructor(inst)}
                          disabled={isUpdating}
                        >
                          <LuTrash2 aria-hidden="true" />
                          Remove
                        </button>
                        <div
                          className="mi-more-wrap"
                          ref={openMenuId === inst._id ? menuRef : null}
                        >
                          <button
                            type="button"
                            className="mi-btn mi-btn--more"
                            aria-label={`More actions for ${name}`}
                            aria-expanded={openMenuId === inst._id}
                            onClick={() =>
                              setOpenMenuId(openMenuId === inst._id ? null : inst._id)
                            }
                          >
                            <LuEllipsisVertical />
                          </button>
                          {openMenuId === inst._id && (
                            <div className="mi-more-menu" role="menu">
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => handleViewInstructor(inst)}
                              >
                                <LuEye aria-hidden="true" />
                                View profile
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => handleEditInstructor(inst)}
                              >
                                <LuPencil aria-hidden="true" />
                                Edit profile
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                className="is-danger"
                                onClick={() => handleRemoveInstructor(inst)}
                              >
                                <LuTrash2 aria-hidden="true" />
                                Remove from course
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : (
          <div className="mi-body mi-body--add">
            <label className="mi-field-label" htmlFor="mi-add-search">
              Select instructor to assign
            </label>
            <div className="mi-add-row">
              <div className="mi-instructor-picker">
                <StudentCombobox
                  id="mi-add-search"
                  students={availableInstructors}
                  value={selectedInstructorId}
                  onChange={setSelectedInstructorId}
                  placeholder="Search instructor by name or email…"
                  disabled={isUpdating}
                />
              </div>
              <button
                type="button"
                className="mi-btn mi-btn--primary"
                onClick={handleAddInstructor}
                disabled={isUpdating || !selectedInstructorId}
              >
                <LuPlus aria-hidden="true" />
                Add Instructor
              </button>
            </div>
            <p className="mi-add-hint">
              Only instructors not already assigned to this course are shown.
            </p>
          </div>
        )}

        <footer className="mi-footer">
          <p className="mi-footer-info">
            <LuInfo aria-hidden="true" />
            You can add multiple instructors and manage their access for this course.
          </p>
          <button type="button" className="mi-btn mi-btn--ghost" onClick={handleClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CourseTrainers;
