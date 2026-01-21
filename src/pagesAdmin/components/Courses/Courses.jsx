import React, { useState } from "react";
import "./Courses.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


const avatar = "https://i.pravatar.cc/40";

const initialCourses = [
  { id: 1, name: "RPA", more: 5 },
  { id: 2, name: "AWS", more: 6 },
  { id: 3, name: "AWS & DevOps", more: 4 },
  { id: 4, name: "Azure", more: 3 },
  { id: 5, name: "DevOps", more: 5 },
  { id: 6, name: "DevOps", more: 5 },
  { id: 7, name: "AWS & DevOps", more: 4 },
  { id: 8, name: "Azure", more: 3 },
];

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState(initialCourses);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter courses based on active tab and search term
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || (activeTab === "live" && course.id <= 4); // Example: first 4 courses are "live"
    return matchesSearch && matchesTab;
  });

  const rowsPerPage = 7;
  const start = (page - 1) * rowsPerPage;
  const paginated = filteredCourses.slice(start, start + rowsPerPage);
  const totalPages = Math.ceil(filteredCourses.length / rowsPerPage);

  // Reset to page 1 when tab or search changes
  React.useEffect(() => {
    setPage(1);
  }, [activeTab, searchTerm]);

  // ----------------------------- ACTION HANDLERS -----------------------------
  const viewHandler = (course) => {
    navigate(`/admin/course/${course.id}`);
  };

  const editHandler = (course) => {
    navigate(`/admin/edit-course/${course.id}`);
  };

  const usersHandler = (course) => {
    navigate(`/admin/course-users/${course.id}`);
  };

  const deleteHandler = (course) => {
    Swal.fire({
      title: "Delete Course?",
      text: `Are you sure you want to delete "${course.name}"? This action cannot be undone.`,
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
        setCourses((prev) => prev.filter((c) => c.id !== course.id));
        Swal.fire({
          title: "Deleted!",
          text: `"${course.name}" has been deleted successfully.`,
          icon: "success",
          confirmButtonColor: "#28a745",
          timer: 1500
        });
      }
    });
  };
  // ---------------------------------------------------------------------------

  return (
    <div className="courses-wrapper">
      <h1 className="course-title">Course Management</h1>

      <div className="top-row">
        {/* TABS */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Courses
          </button>

          <button
            className={`tab-btn ${activeTab === "live" ? "active" : ""}`}
            onClick={() => setActiveTab("live")}
          >
            Live Courses
          </button>
        </div>

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
        <h2 className="card-title">
          {activeTab === "all" ? "All Courses" : "Live Courses"}
        </h2>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="course-table">
            <thead>
              <tr>
                <th>Courses</th>
                <th>Instructors</th>
                <th>Enrolled</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((course) => (
                <tr key={course.id}>
                  <td>{course.name}</td>
                  <td></td>

                  <td>
                    <div className="avatar-group">
                      {/* {course.students.map((img, i) => (
                        <img src={img} key={i} className="avatar" />
                      ))} */}
                      <span className="more-tag">{course.more}</span>
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
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
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
      </div>
    </div>
  );
};

export default Courses;
