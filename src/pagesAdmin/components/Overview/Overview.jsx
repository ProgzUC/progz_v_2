import React, { useState } from "react";
import "./Overview.css";
import "bootstrap/dist/css/bootstrap.min.css";

import EditCourseModel from "../EditCourseModal/EditCourseModel";
import DeleteConfirm from "../DeleteConfirm/DeleteConfirm";
import StudentListModal from "../StudentListModal/StudentListModal";
import Pagination from "../Pagiation/Pagination";
import Loader from "../../../components/common/Loader/Loader";
import { useAdminDashboard } from "../../../hooks/useAdminStats";

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

import { motion } from "framer-motion";

const MotionDiv = motion.div;

const avatar = "https://i.pravatar.cc/40";

const Overview = () => {
  const {
    stats,
    enrollments,
    userDistribution,
    recentCourses,
    recentStudents,
    isLoading
  } = useAdminDashboard();

  const [courseOverrides, setCourseOverrides] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 3;

  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [studentPopup, setStudentPopup] = useState(null);

  const coursesList = courseOverrides ?? (recentCourses || []);

  const totalPages = Math.ceil(coursesList.length / rowsPerPage);

  const paginatedData = coursesList.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleSaveEdit = (updatedCourse) => {
    const base = courseOverrides ?? (recentCourses || []);
    setCourseOverrides(
      base.map((c) => (c.id === updatedCourse.id ? updatedCourse : c))
    );
    setEditItem(null);
  };

  const handleDelete = (id) => {
    const base = courseOverrides ?? (recentCourses || []);
    setCourseOverrides(base.filter((c) => c.id !== id));
    setDeleteItem(null);
  };

  // Calculate percentage safely
  const totalUsers = userDistribution.reduce((acc, curr) => acc + curr.value, 0);
  const studentData = userDistribution.find(d => d.name === "Students");
  const percentStudents = totalUsers > 0 && studentData
    ? Math.round((studentData.value / totalUsers) * 100)
    : 0;

  const handleGenerateReport = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Courses", stats?.courses || 0],
      ["Total Instructors", stats?.instructors || 0],
      ["Total Students", stats?.students || 0],
      ["Generated At", new Date().toLocaleString()],
    ];

    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `progz-dashboard-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <Loader message="Loading dashboard..." />;
  }

  return (
    <div className="admin-overview-page">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Dashboard Overview</h2>
          <p className="dashboard-subtitle">
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>

        <button className="btn-generate" type="button" onClick={handleGenerateReport}>
          Generate Report
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <MotionDiv className="stats-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="icon-box orange"><i className="bi bi-book"></i></div>
          <h5>Total Courses</h5>
          <p className="value">{stats?.courses || 0}</p>
        </MotionDiv>

        <MotionDiv className="stats-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="icon-box green"><i className="bi bi-person-video"></i></div>
          <h5>Total Instructor</h5>
          <p className="value">{stats?.instructors || 0}</p>
        </MotionDiv>

        <MotionDiv className="stats-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="icon-box pink"><i className="bi bi-mortarboard"></i></div>
          <h5>Total Students</h5>
          <p className="value">{stats?.students || 0}</p>
        </MotionDiv>
      </div>

      {/* Charts */}
      <div className="charts-row">

        {/* Bar Chart */}
        <MotionDiv className="chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h5 className="chart-title">Monthly Enrollments</h5>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={enrollments}>
              <XAxis dataKey="month" />
              <Tooltip />
              <Bar dataKey="value" fill="#22C55E" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </MotionDiv>

        {/* Donut Chart */}
        <MotionDiv className="chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
        </MotionDiv>

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
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((c) => (
                <tr key={c.id}>
                  <td className="course-name">{c.course}</td>
                  <td>{c.instructor}</td>
                  <td className="td-date">{c.date}</td>

                  <td>
                    <div className="student-avatars" onClick={() => c.studentsList?.length > 0 && setStudentPopup(c.studentsList)}>
                      {c.studentsList && c.studentsList.length > 0 ? (
                        c.studentsList.slice(0, 4).map((img, idx) => (
                          <img key={idx} src={img || avatar} className="avatar" />
                        ))
                      ) : (
                        <span style={{ fontSize: '12px', color: '#666666' }}>No students</span>
                      )}
                      {c.more > 0 && <span className="more-count">+{c.more}</span>}
                    </div>
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
              {recentStudents && recentStudents.length > 0 ? (
                recentStudents.map((s, i) => (
                  <tr key={i}>
                    <td className="student-name">{s.name}</td>
                    <td>{s.email}</td>
                    <td className="td-date">{s.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    No recent students found
                  </td>
                </tr>
              )}
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
