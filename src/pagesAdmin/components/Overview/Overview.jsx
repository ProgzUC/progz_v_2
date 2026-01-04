import React, { useState } from "react";
import "./Overview.css";
import "bootstrap/dist/css/bootstrap.min.css";

import EditCourseModel from "../EditCourseModal/EditCourseModel";
import DeleteConfirm from "../DeleteConfirm/DeleteConfirm";
import StudentListModal from "../StudentListModal/StudentListModal";
import Pagination from "../Pagiation/Pagination";

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars

const avatar = "https://i.pravatar.cc/40";

const stats = {
  courses: 63,
  instructors: 49,
  students: 233,
};

const monthlyEnrollments = [
  { month: "Jan", value: 25 },
  { month: "Feb", value: 32 },
  { month: "Mar", value: 45 },
  { month: "Apr", value: 30 },
  { month: "May", value: 22 },
  { month: "Jun", value: 28 },
  { month: "Jul", value: 40 },
  { month: "Aug", value: 58 },
  { month: "Sep", value: 43 },
  { month: "Oct", value: 27 },
  { month: "Nov", value: 36 },
  { month: "Dec", value: 30 },
];

const userDistribution = [
  { name: "Instructors", value: 35 },
  { name: "Students", value: 65 },
];

const initialCourses = [
  {
    id: 1,
    course: "RPA",
    instructor: "John",
    date: "12/11/2025",
    studentsList: [avatar, avatar, avatar, avatar],
    more: 5,
  },
  {
    id: 2,
    course: "AWS",
    instructor: "Mezin",
    date: "18/11/2025",
    studentsList: [avatar, avatar, avatar, avatar],
    more: 10,
  },
  {
    id: 3,
    course: "AWS & DevOps",
    instructor: "Akshay",
    date: "22/11/2025",
    studentsList: [avatar, avatar, avatar, avatar],
    more: 6,
  },
  {
    id: 4,
    course: "Azure",
    instructor: "Deepak",
    date: "29/11/2025",
    studentsList: [avatar, avatar, avatar, avatar],
    more: 1,
  },
];

const initialStudents = [
  { name: "Sanjay", email: "sanjay@xyz.com", date: "25/11/2025" },
  { name: "Mezin", email: "mezin@xyz.com", date: "14/11/2025" },
  { name: "Akshay", email: "akshay@xyz.com", date: "11/11/2025" },
];

const Overview = () => {
  const [courses, setCourses] = useState(initialCourses);
  const [page, setPage] = useState(1);
  const rowsPerPage = 3;

  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [studentPopup, setStudentPopup] = useState(null);

  const totalPages = Math.ceil(courses.length / rowsPerPage);

  const paginatedData = courses.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleSaveEdit = (updatedCourse) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c))
    );
    setEditItem(null);
  };

  const handleDelete = (id) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setDeleteItem(null);
  };

  const percentStudents = Math.round(
    (userDistribution[1].value /
      (userDistribution[0].value + userDistribution[1].value)) *
    100
  );

  return (
    <div className="dashboard-container">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Dashboard Overview</h2>
          <p className="dashboard-subtitle">
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>

        <button className="btn-generate">
          Generate Report
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <motion.div className="stats-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="icon-box orange"><i className="bi bi-book"></i></div>
          <h5>Total Courses</h5>
          <p className="value">{stats.courses}</p>
        </motion.div>

        <motion.div className="stats-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="icon-box green"><i className="bi bi-person-video"></i></div>
          <h5>Total Instructor</h5>
          <p className="value">{stats.instructors}</p>
        </motion.div>

        <motion.div className="stats-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="icon-box pink"><i className="bi bi-mortarboard"></i></div>
          <h5>Total Students</h5>
          <p className="value">{stats.students}</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="charts-row">

        {/* Bar Chart */}
        <motion.div className="chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h5 className="chart-title">Monthly Enrollments</h5>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyEnrollments}>
              <XAxis dataKey="month" />
              <Tooltip />
              <Bar dataKey="value" fill="#22C55E" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Donut Chart */}
        <motion.div className="chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h5 className="chart-title">User Distribution</h5>

          <div className="legend-box">
            <div className="legend-item">
              <span className="legend-dot instructors"></span> Instructors
            </div>
            <div className="legend-item">
              <span className="legend-dot students"></span> Students
            </div>
          </div>

          {/* FIXED DONUT CHART WRAPPER */}
          <div className="donut-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <defs>
                  <linearGradient id="instructorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b47899" />
                    <stop offset="100%" stopColor="#834568" />
                  </linearGradient>
                </defs>

                <Pie
                  data={userDistribution}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                  stroke="none"
                  dataKey="value"
                >
                  <Cell fill="url(#instructorGradient)" />
                  <Cell fill="#22C55E" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* CENTERED PERCENT */}
            <div className="donut-center">
              <h3>{percentStudents}%</h3>
              <p>Students</p>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Tables */}
      <div className="tables-row">

        {/* Courses */}
        <div className="table-card">
          <h5>Recent Courses</h5>

          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Instructor</th>
                <th>Date</th>
                <th>Students</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((c) => (
                <tr key={c.id}>
                  <td>{c.course}</td>
                  <td>{c.instructor}</td>
                  <td>{c.date}</td>

                  <td>
                    <div className="student-avatars" onClick={() => setStudentPopup(c.studentsList)}>
                      {c.studentsList.slice(0, 4).map((img, idx) => (
                        <img key={idx} src={img} className="avatar" />
                      ))}
                      {c.more > 0 && <span className="more-count">+{c.more}</span>}
                    </div>
                  </td>

                  <td className="actions">
                    <i className="bi bi-pencil-square edit-btn" onClick={() => setEditItem(c)}></i>
                    <i className="bi bi-trash delete-btn" onClick={() => setDeleteItem(c)}></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>

        {/* Students */}
        <div className="table-card">
          <h5>Recent Students</h5>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>E-mail</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {initialStudents.map((s, i) => (
                <tr key={i}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {editItem && (
        <EditCourseModel
          course={editItem}
          onClose={() => setEditItem(null)}
          onSave={handleSaveEdit}
        />
      )}

      {deleteItem && (
        <DeleteConfirm
          item={deleteItem}
          onCancel={() => setDeleteItem(null)}
          onConfirm={() => handleDelete(deleteItem.id)}
        />
      )}

      {studentPopup && (
        <StudentListModal
          students={studentPopup}
          onClose={() => setStudentPopup(null)}
        />
      )}
    </div>
  );
};

export default Overview;
