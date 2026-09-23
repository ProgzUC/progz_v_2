import React, { useState, useMemo } from "react";
import "./Courses.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useCourses, useDeleteCourse } from "../../../hooks/useCourses";
import Loader from "../../../components/common/Loader/Loader";
import PaginationBar from "../../../components/common/PaginationBar/PaginationBar";
import PersonStack from "../../../components/common/PersonStack/PersonStack";
import AppSelect from "../../../components/common/AppSelect/AppSelect";
import { LuEye, LuPencil, LuUserPlus, LuTrash2 } from "react-icons/lu";

const Courses = () => {
  const navigate = useNavigate();
  const { data: coursesList, isLoading, isError, error } = useCourses();
  const { mutate: deleteCourseMutation } = useDeleteCourse();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState("");

  const courses = useMemo(() => coursesList || [], [coursesList]);

  const instructorOptions = React.useMemo(() => {
    const map = new Map();
    courses.forEach((course) => {
      (course.instructor || []).forEach((inst) => {
        const id = inst._id || inst.name || `${inst.firstName} ${inst.lastName}`;
        const label = inst.name || `${inst.firstName || ""} ${inst.lastName || ""}`.trim();
        if (id && label) map.set(id, label);
      });
    });
    return Array.from(map.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [courses]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.courseName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesInstructor =
      !selectedInstructor ||
      (course.instructor || []).some(
        (inst) =>
          inst._id === selectedInstructor ||
          inst.name === selectedInstructor ||
          `${inst.firstName || ""} ${inst.lastName || ""}`.trim() === selectedInstructor
      );
    return matchesSearch && matchesInstructor;
  });

  const rowsPerPage = 7;
  const start = (page - 1) * rowsPerPage;
  const paginated = filteredCourses.slice(start, start + rowsPerPage);
  const totalPages = Math.ceil(filteredCourses.length / rowsPerPage);

  React.useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedInstructor]);

  const viewHandler = (course) => {
    navigate(`/admin/course/${course._id}`);
  };

  const editHandler = (course) => {
    navigate(`/admin/edit-course/${course._id}`);
  };

  const usersHandler = (course) => {
    navigate(`/admin/course-users/${course._id}`);
  };

  const deleteHandler = (course) => {
    Swal.fire({
      title: "Delete Course?",
      text: `Are you sure you want to delete "${course.courseName}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
      background: "#fff",
      color: "#333",
      borderRadius: "15px",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCourseMutation(course._id, {
          onSuccess: () => {
            Swal.fire({
              title: "Deleted!",
              text: `"${course.courseName}" has been deleted successfully.`,
              icon: "success",
              confirmButtonColor: "#28a745",
              timer: 1500,
            });
          },
          onError: (err) => {
            Swal.fire({
              title: "Error!",
              text: err.message || "Failed to delete course.",
              icon: "error",
              confirmButtonColor: "#d33",
            });
          },
        });
      }
    });
  };

  return (
    <div className="admin-courses-page">
      <header className="page-hero">
        <h1 className="course-title">Course management</h1>
        <p className="course-subtitle">
          Add courses, assign instructors and see who is enrolled.
        </p>
      </header>

      <div className="top-row">
        <div className="search-actions">
          <div className="search-box">
            <i className="bi bi-search" aria-hidden="true"></i>
            <input
              type="text"
              placeholder="Search courses"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search courses"
            />
          </div>

          <div className="instructor-filter">
            <AppSelect
              icon="bi-person"
              value={selectedInstructor}
              onChange={(e) => setSelectedInstructor(e.target.value)}
              aria-label="Filter by instructor"
              options={[
                { value: "", label: "All instructors" },
                ...instructorOptions.map(({ id, label }) => ({ value: id, label })),
              ]}
            />
            {selectedInstructor && (
              <button
                type="button"
                className="clear-filter-btn"
                onClick={() => setSelectedInstructor("")}
                title="Clear filter"
                aria-label="Clear instructor filter"
              >
                <i className="bi bi-x" aria-hidden="true" />
              </button>
            )}
          </div>

          <button
            type="button"
            className="create-btn"
            onClick={() => navigate("/admin/create-course")}
          >
            + Create new course
          </button>
        </div>
      </div>

      <div className="content-card">
        <div className="card-title-row">
          <h2 className="card-title">All courses</h2>
          <span className="card-count">{filteredCourses.length} shown</span>
        </div>

        {isLoading ? (
          <Loader />
        ) : isError ? (
          <div className="courses-error">
            Error loading courses: {error?.message || "Something went wrong"}
          </div>
        ) : (
          <>
            <p className="admin-table-scroll-hint">Swipe horizontally to view all columns.</p>
            <div className="table-responsive admin-table-wrap" tabIndex={0} aria-label="Courses table">
              <table className="course-table admin-data-table">
                <caption className="sr-only">All courses</caption>
                <thead>
                  <tr>
                    <th scope="col">S.No</th>
                    <th scope="col">Course</th>
                    <th scope="col">Instructors</th>
                    <th scope="col">Enrolled</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginated.length > 0 ? (
                    paginated.map((course, index) => {
                      const count =
                        course.enrolledCount ??
                        course.enrolledStudents?.length ??
                        course.totalEnrolled ??
                        course.studentsCount ??
                        0;

                      return (
                        <tr key={course._id}>
                          <td className="col-sno">{(page - 1) * rowsPerPage + index + 1}</td>
                          <td className="col-course">{course.courseName}</td>
                          <td>
                            <PersonStack
                              names={(course.instructor || []).map((inst) =>
                                inst.name ||
                                `${inst.firstName || ""} ${inst.lastName || ""}`.trim() ||
                                "Instructor"
                              )}
                            />
                          </td>

                          <td>
                            <span className="enrolled-badge">
                              {count} {count === 1 ? "student" : "students"}
                            </span>
                          </td>

                          <td className="actions-cell">
                            <div className="admin-action-group">
                              <button
                                type="button"
                                className="admin-action-btn"
                                aria-label={`View ${course.courseName}`}
                                onClick={() => viewHandler(course)}
                              >
                                <LuEye aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn"
                                aria-label={`Edit ${course.courseName}`}
                                onClick={() => editHandler(course)}
                              >
                                <LuPencil aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn"
                                aria-label={`Manage instructors for ${course.courseName}`}
                                onClick={() => usersHandler(course)}
                              >
                                <LuUserPlus aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn admin-action-btn--danger"
                                aria-label={`Delete ${course.courseName}`}
                                onClick={() => deleteHandler(course)}
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
                      <td colSpan="5" className="empty-row">
                        No courses found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredCourses.length > 0 && totalPages > 1 && (
              <PaginationBar
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                className="pagination"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Courses;
