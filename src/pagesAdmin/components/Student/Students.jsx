import React, { useState } from "react";
import "./Students.css";
import { FaTrash, FaEdit, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Students = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const [students, setStudents] = useState([
    { name: "Tharun", id: "N/A", email: "tharun@progz.tech", mobile: "9176612167", qualification: "Not specified\nN/A • 0 years" },
    { name: "Adhirt Magesh", id: "N/A", email: "adhirtmagesh@gmail.com", mobile: "9080273814", qualification: "Not specified\nN/A • 0 years" },
    { name: "Sanjana", id: "N/A", email: "sanjana@progz.tech", mobile: "9176773381", qualification: "Not specified\nN/A • 0 years" },
    { name: "Pushpa kala", id: "N/A", email: "pushpakala@progz.tech", mobile: "8838160544", qualification: "Not specified\nN/A • 0 years" },
    { name: "Preethi", id: "N/A", email: "preethi@progz.tech", mobile: "9176982417", qualification: "Not specified\nN/A • 0 years" },
    { name: "Roshini", id: "N/A", email: "roshini@progz.tech", mobile: "6381342036", qualification: "Not specified\nN/A • 0 years" },
    { name: "Shanmuga sundari", id: "N/A", email: "shanmugasundari@progz.tech", mobile: "7358568378", qualification: "Not specified\nN/A • 0 years" },
    { name: "Dhanush", id: "N/A", email: "dhanush@progz.tech", mobile: "8610671096", qualification: "Not specified\nN/A • 0 years" },
    { name: "Lakshmi", id: "N/A", email: "lakshmi@progz.tech", mobile: "9500003639", qualification: "Not specified\nN/A • 0 years" },
  ]);

  // Pagination
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };



  return (
    <div className="students-page">
      {/* TOP HEADER */}
      <div className="students-header">
        <h2>Student Management</h2>

        <div className="students-header-right">
          <input
            type="text"
            className="students-search"
            placeholder="Search student"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="students-add-btn" onClick={() => navigate("/dashboard/add-student")}>
            + Add Students
          </button>
        </div>
      </div>

      {/* CARD */}
      <div className="students-card">
        <h3 className="title">Students</h3>

        <table className="students-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>E-mail</th>
              <th>Mobile No</th>
              <th>Qualification</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((s, index) => (
              <tr key={index}>
                <td>
                  {s.name}
                  <div className="student-id">ID: {s.id}</div>
                </td>

                <td>{s.email}</td>
                <td>{s.mobile}</td>

                <td>
                  {s.qualification.split("\n").map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </td>

                <td className="actions">
                  <FaTrash className="icon delete" />
                  <FaEdit
                    className="icon edit"
                    onClick={() => navigate("/dashboard/student-preview", { state: { student: s, initialEditMode: true } })}
                  />
                  <FaEye
                    className="icon view"
                    onClick={() => navigate("/dashboard/student-preview", { state: { student: s, initialEditMode: false } })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button className="page-arrow" onClick={() => changePage(currentPage - 1)}>&lt;</button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
            onClick={() => changePage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button className="page-arrow" onClick={() => changePage(currentPage + 1)}>&gt;</button>
      </div>



    </div>
  );
};

export default Students;
