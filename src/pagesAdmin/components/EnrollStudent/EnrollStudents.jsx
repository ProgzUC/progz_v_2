import React, { useState } from "react";
import "./EnrollStudents.css";

import { useAllUsers } from "../../../hooks/useAdminUsers";
import { useCourses } from "../../../hooks/useCourses";
import { useBatches, useCreateBatch, useEnrollStudent } from "../../../hooks/useBatches";
import Swal from "sweetalert2";
import Loader from "../../../components/common/Loader/Loader";

import CreateBatchModal from "./CreateBatchModal";

const EnrollStudents = () => {
  // Data Fetching
  const { data: users, isLoading: usersLoading } = useAllUsers();
  const { data: coursesData, isLoading: coursesLoading } = useCourses();
  const { data: batchesData, isLoading: batchesLoading } = useBatches();

  const { mutate: enrollStudentMutation } = useEnrollStudent();

  // Filtered Data
  const usersArray = Array.isArray(users) ? users : [];
  const studentsList = usersArray.filter(u => (u.role || "").toLowerCase() === "student");
  // Instructors list for dropdown in Enrolment section (removed from batch creation logic here as it's now in modal)
  const instructorsList = usersArray.filter(u => (u.role || "").toLowerCase() === "trainer" || (u.role || "").toLowerCase() === "instructor");
  const coursesList = coursesData || [];
  const batchesList = batchesData || [];

  // State
  const [selectedStudent, setSelectedStudent] = useState("");
  const [courseSections, setCourseSections] = useState([
    { id: Date.now(), courseId: "", instructorId: "", batchId: "" }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  /* Update Section Field */
  const updateSection = (id, field, value) => {
    setCourseSections(prev => prev.map(sec =>
      sec.id === id ? { ...sec, [field]: value } : sec
    ));
  };

  const addCourse = () => {
    setCourseSections([...courseSections, { id: Date.now(), courseId: "", instructorId: "", batchId: "" }]);
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

    // Validate sections
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
        // Reset ?
      },
      onError: (err) => {
        Swal.fire("Error", err.response?.data?.message || "Enrollment failed", "error");
      }
    });
  };

  if (usersLoading || coursesLoading || batchesLoading) return <Loader />;

  return (
    <div className="admin-enroll-students-page">
      <div className="enroll-container">
        <h1 className="enroll-title">Enroll a Student</h1>

        {/* Student Info */}
        <div className="section">
          <h3 className="section-title">Students Information</h3>
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
          <div key={section.id} className="section">

            <div className="title-row">
              <h3 className="section-title">Course Enrollment – {idx + 1}</h3>

              <div className="title-buttons">
                {idx === 0 && (
                  <button className="add-course-btn" onClick={addCourse}>
                    + Add Another Courses
                  </button>
                )}

                {idx !== 0 && (
                  <button
                    className="delete-icon-btn"
                    onClick={() => deleteCourse(section.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>

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

            <div className="batch-container">
              <a
                href="#"
                className="create-batch-link"
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(true);
                }}
              >
                Create new batch
              </a>

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
            </div>
          </div>
        ))}

        <div className="center-btn">
          <div className="center-btn">
            <button className="enroll-btn" onClick={handleEnroll}>Enroll Student</button>
          </div>
        </div>
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


