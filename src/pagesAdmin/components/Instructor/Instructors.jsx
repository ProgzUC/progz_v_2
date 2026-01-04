import React, { useState } from "react";
import "./Instructors.css";
import { FaTrash, FaEdit, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Instructors = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const [instructors, setInstructors] = useState([
    { name: "Annoushka", email: "annoushkagungee@gmail.com", mobile: "7756049377", qualification: "Not specified\nN/A • 0 years" },
    { name: "Chandrasekar", email: "dcsekars_2000@yahoo.com", mobile: "9586134636", qualification: "Not specified\nN/A • 0 years" },
    { name: "Chirag", email: "chiragsaraswat2@gmail.com", mobile: "8171419031", qualification: "Not specified\nN/A • 0 years" },
    { name: "Dinesh", email: "dineshjh107@gmail.com", mobile: "9994030296", qualification: "Not specified\nN/A • 0 years" },
    { name: "Gowtham", email: "gowthamts18@gmail.com", mobile: "8015456653", qualification: "Not specified\nN/A • 0 years" },
    { name: "Janani", email: "hello@jimhealthcare.in", mobile: "8925310132", qualification: "Not specified\nN/A • 0 years" },
  ]);

  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = instructors.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const changePage = (num) => {
    if (num >= 1 && num <= totalPages) setCurrentPage(num);
  };

  return (
    <div className="inst-page">

      <div className="inst-header">
        <h2>Instructor Management</h2>

        <div className="inst-header-right">
          <input
            type="text"
            className="inst-search"
            placeholder="Search instructor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="inst-add-btn" onClick={() => navigate("/dashboard/add-instructor")}>
            + Add Instructors
          </button>
        </div>
      </div>

      <div className="inst-card">
        <h3 className="title">Instructors</h3>

        <table className="inst-table">
          <thead>
            <tr>
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
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.mobile}</td>

                <td>
                  {item.qualification.split("\n").map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </td>

                <td className="actions">
                  <FaTrash className="icon delete" />
                  <FaEdit
                    className="icon edit"
                    onClick={() => navigate("/dashboard/instructor-preview", { state: { instructor: item, initialEditMode: true } })}
                  />
                  <FaEye
                    className="icon view"
                    onClick={() => navigate("/dashboard/instructor-preview", { state: { instructor: item, initialEditMode: false } })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button className="page-arrow" onClick={() => changePage(currentPage - 1)}>
          &lt;
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
            onClick={() => changePage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button className="page-arrow" onClick={() => changePage(currentPage + 1)}>
          &gt;
        </button>
      </div>

    </div>
  );
};

export default Instructors;
