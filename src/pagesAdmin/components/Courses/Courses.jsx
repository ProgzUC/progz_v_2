import React, { useState } from "react";
import "./Courses.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useCourses, useDeleteCourse } from "../../../hooks/useCourses";
import Loader from "../../../components/common/Loader/Loader";

const Courses = () => {
  const navigate = useNavigate();
  const { data: coursesList, isLoading, isError, error } = useCourses();
  const { mutate: deleteCourseMutation } = useDeleteCourse();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const courses = coursesList || [];

  // Filter courses based on search term
  const filteredCourses = courses.filter((course) => {
    return course.courseName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const rowsPerPage = 7;
  const start = (page - 1) * rowsPerPage;
  const paginated = filteredCourses.slice(start, start + rowsPerPage);
  const totalPages = Math.ceil(filteredCourses.length / rowsPerPage);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // ----------------------------- ACTION HANDLERS -----------------------------
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
      borderRadius: "15px"
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCourseMutation(course._id, {
          onSuccess: () => {
            Swal.fire({
              title: "Deleted!",
              text: `"${course.courseName}" has been deleted successfully.`,
              icon: "success",
              confirmButtonColor: "#28a745",
              timer: 1500
            });
          },
          onError: (err) => {
            Swal.fire({
              title: "Error!",
              text: err.message || "Failed to delete course.",
              icon: "error",
              confirmButtonColor: "#d33",
            });
          }
        });
      }
    });
  };
  // ---------------------------------------------------------------------------

  return (
    <div className="admin-courses-page">
      <h1 className="course-title">Course Management</h1>

      <div className="top-row">
        {/* SEARCH & CREATE BUTTON */}
        <div className="search-actions">
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search courses"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="create-btn" onClick={() => navigate("/admin/create-course")}>
            + Create New Course
          </button>
        </div>
      </div>

      {/* CONTENT CARD */}
      <div className="content-card">
        <h2 className="card-title">All Courses</h2>

        {isLoading ? (
          <Loader />
        ) : isError ? (
          <div style={{ textAlign: "center", padding: "40px", color: "red" }}>
            Error loading courses: {error?.message || "Something went wrong"}
          </div>
        ) : (
          <>
            {/* TABLE */}
            <div className="table-responsive">
              <table className="course-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Courses</th>
                    <th>Instructors</th>
                    <th>Enrolled</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginated.length > 0 ? (
                    paginated.map((course, index) => (
                      <tr key={course._id}>
                        <td>{(page - 1) * rowsPerPage + index + 1}</td>
                        <td>{course.courseName}</td>
                        <td>
                          <div className="avatar-group">
                            {course.instructor && course.instructor.length > 0 ? (
                              course.instructor.map((inst, i) => (
                                 <span>
                                {/* // <img
                                //   key={inst._id || i}
                                //   src={inst.profilePicture?.url || "https://ui-avatars.com/api/?name=" + (inst.firstName || inst.name || "T") + "&background=random"}
                                //   className="avatar"
                                //   title={inst.name || `${inst.firstName || ""} ${inst.lastName || ""}`}
                                //   alt="instructor"
                                // /> */}
                                {inst.name || `${inst.firstName || ""} ${inst.lastName || ""}`}
                                &nbsp;
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: "12px", color: "#999" }}>No Instructors</span>
                            )}
                          </div>
                        </td>

                        <td>
                          <div className="avatar-group">
                            <span className="more-tag">{course.enrolledStudents?.length || 0}</span>
                          </div>
                        </td>

                        <td className="actions-cell">
                          <div className="actions-row">
                            <i className="bi bi-eye" onClick={() => viewHandler(course)}></i>
                            <i className="bi bi-pencil" onClick={() => editHandler(course)}></i>
                            <i className="bi bi-people" onClick={() => usersHandler(course)}></i>
                            <i className="bi bi-trash" onClick={() => deleteHandler(course)}></i>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "30px" }}>
                        No courses found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {filteredCourses.length > 0 && (
              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                  &lt;
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={page === i + 1 ? "active" : ""}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  &gt;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Courses;
