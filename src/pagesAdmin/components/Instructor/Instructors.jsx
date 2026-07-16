import React, { useState } from "react";
import "./Instructors.css";
import Loader from "../../../components/common/Loader/Loader";
import PaginationBar from "../../../components/common/PaginationBar/PaginationBar";
import { useAllUsers, useDeleteUser } from "../../../hooks/useAdminUsers";
import { FaTrash, FaEdit, FaEye } from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Instructors = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // const [instructors, setInstructors] = useState([...]); // Removed static data
  const { data: allUsers = [], isLoading, isError } = useAllUsers();

  const instructors = allUsers.filter(
    (user) => user.role === "trainer" || user.role === "instructor"
  );

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = instructors.filter((i) => {
    const term = search.toLowerCase();
    return (
      (i.name || "").toLowerCase().includes(term) ||
      (i.email || "").toLowerCase().includes(term) ||
      (i.phone || "").includes(search)
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
      title: 'Delete Instructor?',
      text: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser(user._id || user.id);
        Swal.fire('Deleted!', 'Instructor has been deleted.', 'success');
      }
    });
  };

  const changePage = (num) => {
    if (num >= 1 && num <= totalPages) setCurrentPage(num);
  };

  if (isLoading) return <Loader />;
  if (isError) return <div>Error loading instructors</div>;

  return (
    <div className="admin-instructors-page">

      <div className="inst-header">
        <h2>Instructor Management</h2>

        <div className="inst-header-right">
          <input
            type="text"
            className="inst-search"
            placeholder="Search instructor"
            value={search}
            onChange={handleSearchChange}
          />

          <button className="inst-add-btn" onClick={() => navigate("/admin/add-instructor")}>
            + Add Instructors
          </button>
        </div>
      </div>

      <div className="inst-card">
        <h3 className="title">Instructors</h3>

        <table className="inst-table">
          <thead>
            <tr>
              <th className="s-no">S.No</th>
              <th>Instructor</th>
              <th>E-mail</th>
              <th>Mobile No</th>
              <th>Qualification</th>
              <th style={{ width: "130px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={index}>
                <td className="s-no">{(activePage - 1) * itemsPerPage + index + 1}</td>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.phone}</td>

                <td>
                  {(item.education || item.qualification || "Not specified").split("\n").map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </td>

                <td className="actions">
                  <FaTrash className="icon delete" onClick={() => handleDelete(item)} />
                  <FaEdit
                    className="icon edit"
                    onClick={() => navigate("/admin/instructor-preview", { state: { instructor: item, initialEditMode: true } })}
                  />
                  <FaEye
                    className="icon view"
                    onClick={() => navigate("/admin/instructor-preview", { state: { instructor: item, initialEditMode: false } })}
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
  );
};

export default Instructors;
