import React, { useState } from "react";
import "./CourseTrainers.css";
import { useParams, useNavigate } from "react-router-dom";

import { useCourse, useUpdateCourse } from "../../../hooks/useCourses";
import { useAllUsers } from "../../../hooks/useAdminUsers";
import Loader from "../../../components/common/Loader/Loader";
import Swal from "sweetalert2";

const CourseTrainers = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: course, isLoading: isCourseLoading } = useCourse(id);
  const { data: allUsers, isLoading: isUsersLoading } = useAllUsers();
  const { mutate: updateCourseMutation } = useUpdateCourse();

  const [selectedInstructorId, setSelectedInstructorId] = useState("");
  const [instructorSearchTerm, setInstructorSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isLoading = isCourseLoading || isUsersLoading;

  // Derive Data
  const currentInstructors = course?.instructor || [];

  // Filter available users: 
  // 1. Must NOT be in currentInstructors
  // 2. Ideally should have 'Instructor' role, but if schema is flexible, maybe just all users? 
  //    Let's assume we want to pick from anyone or filter by role if 'role' field exists.
  //    Looking at StudentPreview, role is "Student" or "Instructor".
  const availableCandidates = (allUsers || []).filter(user => {
    const isAlreadyAssigned = currentInstructors.some(inst => inst._id === user._id);
    const isInstructor = user.role === "trainer"; // Filter by role
    
    // Filter by search term
    const searchLower = instructorSearchTerm.toLowerCase();
    const matchesSearch = 
        !instructorSearchTerm || 
        user.name?.toLowerCase().includes(searchLower) || 
        user.email?.toLowerCase().includes(searchLower);

    return !isAlreadyAssigned && isInstructor && matchesSearch;
  });

  const handleUpdateInstructors = (newInstructorList) => {
    setIsUpdating(true);
    // Prepare payload: Preserve existing course data, update ONLY instructors
    // We need to send IDs of instructors.
    const instructorIds = newInstructorList.map(inst => inst._id);

    const payload = {
      ...course,
      instructor: instructorIds,
      // Ensure we don't accidentally send derived/populated fields that backend might reject if it expects clean DTO
      // But usually Mongoose handles extra fields or we might need to be specific.
      // EditCourse sends: courseName, courseId, courseDescription, courseDuration, thumbnail, modules.
      // Let's stick to the EditCourse payload structure to be safe.
      courseName: course.courseName,
      courseId: course.courseId,
      courseDescription: course.courseDescription,
      courseDuration: course.courseDuration,
      thumbnail: course.thumbnail,
      modules: course.modules // Send back existing modules as is
    };

    updateCourseMutation({ id, data: payload }, {
      onSuccess: () => {
        Swal.fire({
          title: "Updated",
          text: "Instructors list updated successfully!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
        setIsUpdating(false);
        setSelectedInstructorId("");
      },
      onError: (err) => {
        Swal.fire("Error", err.message || "Failed to update instructors", "error");
        setIsUpdating(false);
      }
    });
  };

  const handleAddInstructor = () => {
    if (!selectedInstructorId) {
      Swal.fire("Attention", "Please select an instructor from the dropdown list first.", "warning");
      return;
    }
    const user = allUsers.find(u => u._id === selectedInstructorId);
    if (!user) return;

    const newList = [...currentInstructors, user];
    
    // Clear the input and specific selection after adding to prevent stale state
    setInstructorSearchTerm("");
    
    handleUpdateInstructors(newList);
  };

  const handleRemoveInstructor = (instructorId) => {
    const newList = currentInstructors.filter(inst => inst._id !== instructorId);
    handleUpdateInstructors(newList);
  };

  if (isLoading) return <div className="manage-instructors-container"><Loader /></div>;
  if (!course) return <div className="manage-instructors-container"><div className="error-state">Course not found</div></div>;

  return (
    <div className="manage-instructors-container">
      <div className="manage-card">
        <button className="close-btn" onClick={() => navigate(-1)}>
          &times;
        </button>

        <h2 className="title">Manage Instructors</h2>
        <p className="subtitle">{course.courseName}</p>

        {isUpdating && (
          <div className="update-overlay">
            <p>Updating...</p>
          </div>
        )}

        <div className="input-group">
          <label className="section-label">Add New Instructor</label>

          <div className="select-row">
            <div className="searchable-select-container">
              <i className="bi bi-search search-icon-input"></i>
              <input
                type="text"
                className="searchable-select-input"
                placeholder="Type to search instructor..."
                value={instructorSearchTerm}
                onChange={(e) => {
                  setInstructorSearchTerm(e.target.value);
                  setSelectedInstructorId("");
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)} // Delay for click
              />
              <i className={`bi bi-chevron-down dropdown-icon ${isDropdownOpen ? 'open' : ''}`}></i>

              {isDropdownOpen && (
                <ul className="searchable-select-dropdown">
                  {availableCandidates.length > 0 ? (
                    availableCandidates.map((inst) => (
                      <li
                        key={inst._id}
                        className={`dropdown-item ${selectedInstructorId === inst._id ? "selected" : ""}`}
                        onMouseDown={() => {
                          // use onMouseDown instead of onClick so it fires before onBlur takes away the dropdown
                          setSelectedInstructorId(inst._id);
                          setInstructorSearchTerm(`${inst.name} (${inst.email})`);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <div className="dropdown-name">{inst.name}</div>
                        <div className="dropdown-email">{inst.email}</div>
                      </li>
                    ))
                  ) : (
                    <li className="dropdown-item empty">No matching instructors found</li>
                  )}
                </ul>
              )}
            </div>

            <button className="add-btn" onClick={handleAddInstructor}>
              Add
            </button>
          </div>
        </div>

        <div className="current-instructors-section">
          <label className="section-label">Current Instructors</label>

          {currentInstructors.length === 0 ? (
            <p className="empty-msg">No instructors assigned to this course.</p>
          ) : (
            <ul className="instructor-list">
              {currentInstructors.map((inst, idx) => (
                <li key={inst._id || idx} className="instructor-item">
                  <div className="instructor-info">
                    <span className="instructor-name">{inst.name}</span>
                    <span className="instructor-email">{inst.email}</span>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveInstructor(inst._id)}
                    disabled={isUpdating}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-footer">
          <button className="done-btn" onClick={() => navigate(-1)}>
            Done
          </button>
        </div>
      </div>
    </div >
  );
};

export default CourseTrainers;
