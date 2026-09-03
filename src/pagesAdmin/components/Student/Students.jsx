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
          <label htmlFor="students-search" className="sr-only">
            Search students
          </label>
          <input
            id="students-search"
            type="search"
            className="students-search"
            placeholder="Search student"
            value={search}
            onChange={handleSearchChange}
            aria-label="Search students by name, email, or phone"
          />

          <button className="students-add-btn" onClick={() => navigate("/admin/add-student")}>
            + Add Students
          </button>
        </div>
      </div>

      {/* CARD */}
      <div className="students-card">
        <h3 className="title">Students</h3>

        <p className="admin-table-scroll-hint">Swipe horizontally to view all columns.</p>
        <div className="admin-table-wrap" tabIndex={0} aria-label="Students table">
          <table className="students-table admin-data-table">
            <caption className="sr-only">Registered students</caption>
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
                <th className="s-no" scope="col">S.No</th>
                <th scope="col">Student</th>
                <th scope="col">E-mail</th>
                <th scope="col">Mobile No</th>
                <th scope="col">Qualification</th>
                <th scope="col" style={{ width: "120px" }}>Actions</th>
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
                    <button
                      type="button"
                      className="admin-action-btn admin-action-btn--danger"
                      aria-label={`Delete ${s.name}`}
                      onClick={() => handleDelete(s)}
                    >
                      <FaTrash aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="admin-action-btn"
                      aria-label={`Edit ${s.name}`}
                      onClick={() => navigate("/admin/student-preview", { state: { student: s, initialEditMode: true } })}
                    >
                      <FaEdit aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="admin-action-btn"
                      aria-label={`View ${s.name}`}
                      onClick={() => navigate("/admin/student-preview", { state: { student: s, initialEditMode: false } })}
                    >
                      <FaEye aria-hidden="true" />
                    </button>
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

