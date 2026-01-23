import React, { useState } from "react";
import "./Students.css";
import Loader from "../../../components/common/Loader/Loader";
import { useAllUsers, useDeleteUser } from "../../../hooks/useAdminUsers";
import { FaTrash, FaEdit, FaEye } from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Students = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // const [students, setStudents] = useState([...]); // Removed static data
  const { data: allUsers = [], isLoading, isError } = useAllUsers();

  const students = allUsers.filter((user) => user.role === "student");

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

  const { mutate: deleteUser } = useDeleteUser();

  const handleDelete = (user) => {
    Swal.fire({
      title: 'Delete Student?',
      text: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser(user._id || user.id);
        Swal.fire('Deleted!', 'Student has been deleted.', 'success');
      }
    });
  };

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (isLoading) return <Loader />;
  if (isError) return <div>Error loading students</div>;



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

          <button className="students-add-btn" onClick={() => navigate("/admin/add-student")}>
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
                <td>{s.phone}</td>

                <td>
                  {(s.qualification || "Not specified").split("\n").map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </td>

                <td className="actions">
                  <FaTrash className="icon delete" onClick={() => handleDelete(s)} />
                  <FaEdit
                    className="icon edit"
                    onClick={() => navigate("/admin/student-preview", { state: { student: s, initialEditMode: true } })}
                  />
                  <FaEye
                    className="icon view"
                    onClick={() => navigate("/admin/student-preview", { state: { student: s, initialEditMode: false } })}
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
