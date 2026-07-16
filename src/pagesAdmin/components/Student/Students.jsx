import React, { useState } from "react";
import "./Students.css";
import Loader from "../../../components/common/Loader/Loader";
import PaginationBar from "../../../components/common/PaginationBar/PaginationBar";
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

  const filtered = students.filter((s) => {
    const term = search.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(term) ||
      (s.email || "").toLowerCase().includes(term) ||
      (s.phone || "").includes(search)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedData = filtered.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

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
    <div className="admin-students-page">
      {/* TOP HEADER */}
      <div className="students-header">
        <h2>Student Management</h2>

        <div className="students-header-right">
          <input
            type="text"
            className="students-search"
            placeholder="Search student"
            value={search}
            onChange={handleSearchChange}
          />

          <button className="students-add-btn" onClick={() => navigate("/admin/add-student")}>
            + Add Students
          </button>
        </div>
      </div>

      {/* CARD */}
      <div className="students-card">
        <h3 className="title">Students</h3>

        <div style={{ overflowX: "auto" }}>
          <table className="students-table">
            <colgroup>
              <col style={{ width: "60px" }} />
              <col style={{ width: "200px" }} />
              <col style={{ width: "200px" }} />
              <col style={{ width: "130px" }} />
              <col style={{ width: "160px" }} />
              <col style={{ width: "120px" }} />
            </colgroup>
            <thead>
              <tr>
                <th className="s-no">S.No</th>
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
                  <td className="s-no">{(activePage - 1) * itemsPerPage + index + 1}</td>
                  <td>
                    {s.name}
                    <div className="student-id">ID: {s.id}</div>
                  </td>

                  <td>{s.email}</td>
                  <td>{s.phone}</td>

                  <td>
                    {(s.education || s.qualification || "Not specified").split("\n").map((line, i) => (
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
        <PaginationBar
          currentPage={activePage}
          totalPages={totalPages}
          onPageChange={changePage}
          className="pagination"
        />

      </div>
    </div>
  );
};

export default Students;

