import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Overview.css";

import StudentListModal from "../StudentListModal/StudentListModal";
import Loader from "../../../components/common/Loader/Loader";
import { useAdminDashboard } from "../../../hooks/useAdminStats";
import { getStoredUser } from "../../../utils/authStorage";
import { useAdminTheme } from "../../context/AdminThemeContext";

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

/** Local YYYY-MM-DD helpers */
function toYmd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYmd(value) {
  if (!value || typeof value !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatRangeLabel(startDate, endDate) {
  const start = parseYmd(startDate);
  const end = parseYmd(endDate);
  if (!start || !end) return "";
  const fmt = (d) => d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  const sameYear = start.getFullYear() === end.getFullYear();
  return sameYear
    ? `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`
    : `${fmt(start)}, ${start.getFullYear()} – ${fmt(end)}, ${end.getFullYear()}`;
}

/** Monday–Sunday week containing a date (default: today) */
function getWeekContaining(anchor = new Date()) {
  const base = anchor instanceof Date ? new Date(anchor) : parseYmd(anchor) || new Date();
  const day = base.getDay() || 7;
  const start = new Date(base);
  start.setHours(0, 0, 0, 0);
  start.setDate(base.getDate() - day + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { startDate: toYmd(start), endDate: toYmd(end) };
}

function shiftRange(startDate, endDate, deltaDays) {
  const start = parseYmd(startDate);
  const end = parseYmd(endDate);
  if (!start || !end) return getWeekContaining();
  start.setDate(start.getDate() + deltaDays);
  end.setDate(end.getDate() + deltaDays);
  return { startDate: toYmd(start), endDate: toYmd(end) };
}

function getMonthRange(yearMonth) {
  // yearMonth = "YYYY-MM"
  const m = /^(\d{4})-(\d{2})$/.exec(String(yearMonth || ""));
  if (!m) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { startDate: toYmd(start), endDate: toYmd(end) };
  }
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const start = new Date(y, mo, 1);
  const end = new Date(y, mo + 1, 0);
  return { startDate: toYmd(start), endDate: toYmd(end) };
}

function monthValueFromRange(startDate) {
  const d = parseYmd(startDate);
  if (!d) return toYmd(new Date()).slice(0, 7);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
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
  const [range, setRange] = useState(() => getWeekContaining());
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);
  const { accentSwatch } = useAdminTheme();
  const chartPrimary = accentSwatch?.[0] || "#064E3B";
  const chartBright = accentSwatch?.[1] || "#10B981";

  const rangeLabel = useMemo(
    () => formatRangeLabel(range.startDate, range.endDate),
    [range.startDate, range.endDate]
  );
  const isCurrentWeek = useMemo(() => {
    const cur = getWeekContaining();
    return range.startDate === cur.startDate && range.endDate === cur.endDate;
  }, [range.startDate, range.endDate]);

  const {
    stats,
    enrollments,
    userDistribution,
    recentCourses,
    recentStudents,
    isLoading,
    isFetching,
  } = useAdminDashboard({ startDate: range.startDate, endDate: range.endDate });

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
  const weeklyEnrollments = sparkPoints.reduce((sum, n) => sum + n, 0);

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
      ["Range", rangeLabel],
      ["Courses", numbers.courses],
      ["Instructors joined", numbers.instructors],
      ["Students joined", numbers.students],
      ["Batches", numbers.batches],
      ["Enrollments", weeklyEnrollments],
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

  const applyStartDate = (value) => {
    if (!value) return;
    let end = range.endDate;
    if (parseYmd(value) && parseYmd(end) && parseYmd(value) > parseYmd(end)) {
      end = value;
    }
    setRange({ startDate: value, endDate: end });
  };

  const applyEndDate = (value) => {
    if (!value) return;
    let start = range.startDate;
    if (parseYmd(value) && parseYmd(start) && parseYmd(value) < parseYmd(start)) {
      start = value;
    }
    setRange({ startDate: start, endDate: value });
  };

  const applyMonth = (yearMonth) => {
    if (!yearMonth) return;
    setRange(getMonthRange(yearMonth));
  };

  const jumpToDate = (value) => {
    if (!value) return;
    setRange(getWeekContaining(value));
  };

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") setPickerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!pickerOpen) return undefined;
    const onPointer = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [pickerOpen]);

  if (isLoading) {
    return <Loader message="Loading dashboard..." />;
  }

  const peakDay = sparkPoints.length ? Math.max(...sparkPoints) : 0;

  const topCards = [
    { key: "courses", label: "Courses", value: numbers.courses, icon: "bi-book", tone: "amber", trend: null },
    { key: "instructors", label: "Instructors joined", value: numbers.instructors, icon: "bi-person-video3", tone: "sky", trend: null },
    { key: "students", label: "Students joined", value: numbers.students, icon: "bi-mortarboard", tone: "emerald", trend: enrollTrend },
    { key: "batches", label: "Batches", value: numbers.batches, icon: "bi-layers", tone: "primary", trend: null },
  ];

  const bottomCards = [
    { key: "enroll-week", label: "Enrollments", value: weeklyEnrollments, icon: "bi-graph-up-arrow", tone: "emerald", trend: enrollTrend },
    { key: "enroll-peak", label: "Peak day enrollments", value: peakDay, icon: "bi-people", tone: "primary", trend: null },
    { key: "pending", label: "Pending Approvals", value: numbers.pending, icon: "bi-hourglass-split", tone: "rose", trend: null },
    { key: "users", label: "Users joined", value: numbers.users, icon: "bi-person-check", tone: "sky", trend: null },
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
              {Math.abs(card.trend)}% vs prior day
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
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything..."
            aria-label="Search dashboard"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd>Ctrl + K</kbd>
        </label>

        <div className="dashboard-actions">
          <div
            className={`date-chip ${isFetching ? "is-fetching" : ""} ${pickerOpen ? "is-open" : ""}`}
            role="group"
            aria-label="Date filter"
            ref={pickerRef}
          >
            <button
              type="button"
              className="date-nav"
              onClick={() => setRange((r) => shiftRange(r.startDate, r.endDate, -7))}
              aria-label="Previous period"
              title="Previous 7 days"
            >
              <i className="bi bi-chevron-left"></i>
            </button>

            <button
              type="button"
              className="date-chip-toggle"
              onClick={() => setPickerOpen((o) => !o)}
              aria-expanded={pickerOpen}
              aria-haspopup="dialog"
              title="Edit date range"
            >
              <i className="bi bi-calendar3"></i>
              <span>{rangeLabel}</span>
              <i className={`bi bi-chevron-${pickerOpen ? "up" : "down"} date-caret`}></i>
            </button>

            <button
              type="button"
              className="date-nav"
              onClick={() => setRange((r) => shiftRange(r.startDate, r.endDate, 7))}
              aria-label="Next period"
              title="Next 7 days"
            >
              <i className="bi bi-chevron-right"></i>
            </button>

            {!isCurrentWeek && (
              <button
                type="button"
                className="date-today"
                onClick={() => {
                  setRange(getWeekContaining());
                  setPickerOpen(false);
                }}
                title="Back to this week"
              >
                Today
              </button>
            )}

            {pickerOpen && (
              <div className="date-picker-panel" role="dialog" aria-label="Select date range">
                <div className="date-picker-row">
                  <label>
                    <span>From</span>
                    <input
                      type="date"
                      value={range.startDate}
                      max={range.endDate}
                      onChange={(e) => applyStartDate(e.target.value)}
                    />
                  </label>
                  <label>
                    <span>To</span>
                    <input
                      type="date"
                      value={range.endDate}
                      min={range.startDate}
                      onChange={(e) => applyEndDate(e.target.value)}
                    />
                  </label>
                </div>

                <div className="date-picker-row">
                  <label className="date-picker-month">
                    <span>Month</span>
                    <input
                      type="month"
                      value={monthValueFromRange(range.startDate)}
                      onChange={(e) => applyMonth(e.target.value)}
                    />
                  </label>
                  <label>
                    <span>Jump to date</span>
                    <input
                      type="date"
                      value={range.startDate}
                      onChange={(e) => jumpToDate(e.target.value)}
                    />
                  </label>
                </div>

                <div className="date-picker-actions">
                  <button
                    type="button"
                    className="date-preset"
                    onClick={() => setRange(getWeekContaining())}
                  >
                    This week
                  </button>
                  <button
                    type="button"
                    className="date-preset"
                    onClick={() => setRange(getMonthRange(monthValueFromRange(toYmd(new Date()))))}
                  >
                    This month
                  </button>
                  <button
                    type="button"
                    className="date-preset date-preset-done"
                    onClick={() => setPickerOpen(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
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
            <span className="card-sub">{rangeLabel}</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="enrollFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartBright} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={chartBright} stopOpacity={0} />
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
                  stroke={chartBright}
                  strokeWidth={2.5}
                  fill="url(#enrollFill)"
                  activeDot={{ r: 6, fill: chartPrimary, stroke: "#fff", strokeWidth: 2 }}
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
                          fill={i === 0 ? chartPrimary : chartBright}
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
