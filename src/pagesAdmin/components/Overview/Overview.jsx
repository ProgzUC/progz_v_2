import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Overview.css";

import StudentListModal from "../StudentListModal/StudentListModal";
import Loader from "../../../components/common/Loader/Loader";
import { useAdminDashboard } from "../../../hooks/useAdminStats";
import { getStoredUser } from "../../../utils/authStorage";

import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { motion } from "framer-motion";

const MotionDiv = motion.div;

const avatarFallback = (name = "User") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=064E3B&color=fff&size=64`;

const COURSE_TONES = ["emerald", "amber", "sky", "rose"];

function Sparkline({ points = [], up = true }) {
  if (!points || points.length < 2) return null;

  const w = 88;
  const h = 36;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / span) * (h - 6) - 3;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg className={`sparkline ${up ? "up" : "down"}`} viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EnrollTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      <span>Enrollments: {payload[0].value}</span>
    </div>
  );
}

function weekRangeLabel() {
  const now = new Date();
  const day = now.getDay() || 7;
  const start = new Date(now);
  start.setDate(now.getDate() - day + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d) => d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`;
}

function readStats(stats = {}) {
  const instructors = stats.instructors ?? 0;
  const students = stats.students ?? 0;
  return {
    courses: stats.courses ?? stats.totalCourses ?? 0,
    instructors,
    students,
    batches: stats.totalBatches ?? stats.batches ?? 0,
    pending: stats.pendingApprovals ?? stats.pending ?? 0,
    users: stats.totalUsers ?? instructors + students,
  };
}

function trendFromSeries(points) {
  if (!points || points.length < 2) return null;
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  if (!prev) return last ? 100 : 0;
  return Math.round(((last - prev) / prev) * 100);
}

function courseStatus(course) {
  const raw = (course.status || course.courseStatus || "").toString();
  if (raw) return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  const count = course.studentsList?.length || course.students || 0;
  return count > 0 ? "Published" : "Draft";
}

function studentStatus(student) {
  const raw = (student.status || "").toString().toLowerCase();
  if (raw === "inactive" || raw === "blocked" || student.isActive === false) return "Inactive";
  return "Active";
}

const Overview = () => {
  const {
    stats,
    enrollments,
    userDistribution,
    recentCourses,
    recentStudents,
    isLoading,
  } = useAdminDashboard();

  const user = getStoredUser();
  const firstName = (user?.name || "Admin").split(" ")[0];
  const roleLabel = user?.role ? String(user.role).replace(/^\w/, (c) => c.toUpperCase()) : "Super Admin";

  const searchRef = useRef(null);
  const [query, setQuery] = useState("");
  const [studentPopup, setStudentPopup] = useState(null);

  const numbers = readStats(stats);

  const chartData = (enrollments || []).map((e) => ({
    month: e.month || e.label || e.name || "",
    value: Number(e.value ?? e.count ?? e.enrollments ?? 0),
  }));

  const sparkPoints = chartData.map((d) => d.value);
  const enrollTrend = trendFromSeries(sparkPoints);
  const monthlyEnrollments = sparkPoints.length ? sparkPoints[sparkPoints.length - 1] : 0;
  const totalEnrollments = sparkPoints.reduce((sum, n) => sum + n, 0);

  const dist = (userDistribution || []).map((d) => ({
    name: d.name || d.role || "Other",
    value: Number(d.value ?? d.count ?? 0),
  }));
  const totalUsers = dist.reduce((acc, curr) => acc + curr.value, 0);
  const studentData = dist.find((d) => /student/i.test(d.name));
  const percentStudents = totalUsers > 0 && studentData
    ? Math.round((studentData.value / totalUsers) * 100)
    : 0;

  const q = query.trim().toLowerCase();
  const coursesList = (recentCourses || []).filter((c) => {
    if (!q) return true;
    return [c.course, c.courseName, c.instructor, c.status]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });
  const studentsList = (recentStudents || []).filter((s) => {
    if (!q) return true;
    return [s.name, s.email]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const handleGenerateReport = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Courses", numbers.courses],
      ["Total Instructors", numbers.instructors],
      ["Total Students", numbers.students],
      ["Total Batches", numbers.batches],
      ["Pending Approvals", numbers.pending],
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

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (isLoading) {
    return <Loader message="Loading dashboard..." />;
  }

  const topCards = [
    { key: "courses", label: "Total Courses", value: numbers.courses, icon: "bi-book", tone: "amber", trend: null },
    { key: "instructors", label: "Total Instructors", value: numbers.instructors, icon: "bi-person-video3", tone: "sky", trend: null },
    { key: "students", label: "Total Students", value: numbers.students, icon: "bi-mortarboard", tone: "emerald", trend: enrollTrend },
    { key: "batches", label: "Total Batches", value: numbers.batches, icon: "bi-layers", tone: "primary", trend: null },
  ];

  const bottomCards = [
    { key: "enroll-month", label: "Monthly Enrollments", value: monthlyEnrollments, icon: "bi-graph-up-arrow", tone: "emerald", trend: enrollTrend },
    { key: "enroll-total", label: "Total Enrollments", value: totalEnrollments, icon: "bi-people", tone: "primary", trend: enrollTrend },
    { key: "pending", label: "Pending Approvals", value: numbers.pending, icon: "bi-hourglass-split", tone: "rose", trend: null },
    { key: "users", label: "Total Users", value: numbers.users, icon: "bi-person-check", tone: "sky", trend: null },
  ];

  const renderStatCard = (card, i) => (
    <MotionDiv
      key={card.key}
      className="stats-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05, duration: 0.35 }}
    >
      <div className={`icon-box ${card.tone}`}>
        <i className={`bi ${card.icon}`}></i>
      </div>
      <div className="stats-copy">
        <p className="stats-label">{card.label}</p>
        <div className="stats-meta">
          <p className="value">{card.value}</p>
          {card.trend != null && (
            <span className={`trend ${card.trend >= 0 ? "up" : "down"}`}>
              <i className={`bi ${card.trend >= 0 ? "bi-arrow-up-right" : "bi-arrow-down-right"}`}></i>
              {Math.abs(card.trend)}% this month
            </span>
          )}
        </div>
      </div>
      <Sparkline points={sparkPoints} up={card.trend == null || card.trend >= 0} />
    </MotionDiv>
  );

  return (
    <div className="admin-overview-page">
      <div className="dashboard-header">
        <div className="dashboard-heading">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, {firstName}</p>
        </div>

        <label className="dashboard-search">
          <i className="bi bi-search"></i>
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything..."
            aria-label="Search dashboard"
          />
          <kbd>Ctrl + K</kbd>
        </label>

        <div className="dashboard-actions">
          <div className="date-chip">
            <i className="bi bi-calendar3"></i>
            <span>{weekRangeLabel()}</span>
          </div>

          <button className="icon-action" type="button" onClick={handleGenerateReport} title="Generate report">
            <i className="bi bi-download"></i>
          </button>

          <Link to="/admin/approve-users" className="icon-action" title="Notifications">
            <i className="bi bi-bell"></i>
            {numbers.pending > 0 && <span className="notify-badge">{numbers.pending}</span>}
          </Link>

          <div className="profile-chip">
            <img src={avatarFallback(user?.name || "Admin")} alt="" />
            <div>
              <strong>{user?.name || "Admin"}</strong>
              <span>{roleLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-row">{topCards.map(renderStatCard)}</div>

      <div className="charts-row">
        <MotionDiv className="chart-card enrollment-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card-head">
            <h2 className="chart-title">Enrollment Overview</h2>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="enrollFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                />
                <Tooltip content={<EnrollTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fill="url(#enrollFill)"
                  activeDot={{ r: 6, fill: "#064E3B", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-note">No enrollment data yet.</p>
          )}
        </MotionDiv>

        <MotionDiv className="chart-card distribution-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card-head">
            <h2 className="chart-title">User Distribution</h2>
          </div>

          {dist.length > 0 ? (
            <div className="donut-layout">
              <div className="donut-wrapper">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={dist}
                      innerRadius={68}
                      outerRadius={96}
                      paddingAngle={4}
                      stroke="none"
                      dataKey="value"
                    >
                      {dist.map((entry, i) => (
                        <Cell
                          key={entry.name}
                          fill={i === 0 ? "#064E3B" : "#10B981"}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center">
                  <h3>{percentStudents}%</h3>
                  <p>Students</p>
                </div>
              </div>

              <div className="legend-box">
                {dist.map((entry, i) => (
                  <div className="legend-item" key={entry.name}>
                    <span className={`legend-dot ${i === 0 ? "instructors" : "students"}`}></span>
                    <div>
                      <strong>{entry.name}</strong>
                      <span>
                        {entry.value} · {totalUsers ? Math.round((entry.value / totalUsers) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="empty-note">No user distribution data yet.</p>
          )}
        </MotionDiv>
      </div>

      <div className="tables-row">
        <div className="table-card">
          <div className="card-head">
            <h2>Recent Courses</h2>
            <Link to="/admin/courses" className="view-all">View All</Link>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Instructor</th>
                  <th>Date</th>
                  <th>Students</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {coursesList.length > 0 ? (
                  coursesList.slice(0, 5).map((c, idx) => {
                    const title = c.course || c.courseName || "Untitled";
                    const status = courseStatus(c);
                    const count = c.studentsList?.length || c.students || 0;
                    return (
                      <tr key={c.id || c._id || title}>
                        <td>
                          <div className="course-cell">
                            <span className={`course-mark ${COURSE_TONES[idx % COURSE_TONES.length]}`}>
                              {title.charAt(0)}
                            </span>
                            <span className="course-name">{title}</span>
                          </div>
                        </td>
                        <td>{c.instructor || "—"}</td>
                        <td className="td-date">{c.date || "—"}</td>
                        <td>
                          <button
                            type="button"
                            className="count-btn"
                            onClick={() => c.studentsList?.length > 0 && setStudentPopup(c.studentsList)}
                            disabled={!c.studentsList?.length}
                          >
                            {count}
                          </button>
                        </td>
                        <td>
                          <span className={`status-pill ${status.toLowerCase()}`}>{status}</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-cell">No recent courses found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-card">
          <div className="card-head">
            <h2>Recent Students</h2>
            <Link to="/admin/students" className="view-all">View All</Link>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>E-mail</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {studentsList.length > 0 ? (
                  studentsList.slice(0, 5).map((s, i) => {
                    const status = studentStatus(s);
                    return (
                      <tr key={s.id || s._id || s.email || i}>
                        <td>
                          <div className="student-cell">
                            <img src={s.avatar || s.profilePicture || avatarFallback(s.name)} alt="" />
                            <span className="student-name">{s.name}</span>
                          </div>
                        </td>
                        <td>{s.email}</td>
                        <td className="td-date">{s.date || "—"}</td>
                        <td>
                          <span className={`status-pill ${status.toLowerCase()}`}>{status}</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-cell">No recent students found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="stats-row">{bottomCards.map((card, i) => renderStatCard(card, i + 4))}</div>

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
