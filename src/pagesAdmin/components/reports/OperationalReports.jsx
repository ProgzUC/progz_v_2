import { useState } from "react";
import "./OperationalReports.css";
import {
  useOperationalSummary,
  useAttendanceAnalytics,
  useEnrollmentAnalytics,
  useTrainerUtilization,
  useBatchHealth,
} from "../../../hooks/useReports";
import { exportToCSV } from "../../../utils/csvExport";
import { downloadAttendanceCSV } from "../../../api/reportApi";
import Loader from "../../../components/common/Loader/Loader";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

const COLORS = ["#059669", "#0EA5E9", "#8B5CF6", "#F97316", "#64748B"];

const TABS = [
  { id: "executive", label: "Overview", icon: "bi-speedometer2" },
  { id: "attendance", label: "Attendance", icon: "bi-calendar-check" },
  { id: "enrollment", label: "Enrollment", icon: "bi-people" },
  { id: "trainer", label: "Trainers", icon: "bi-person-video3" },
  { id: "health", label: "Batch health", icon: "bi-heart-pulse" },
];

function EmptyBlock({ title, hint }) {
  return (
    <div className="or-empty">
      <i className="bi bi-inbox" aria-hidden="true" />
      <strong>{title}</strong>
      {hint ? <p>{hint}</p> : null}
    </div>
  );
}

function ErrorBlock({ message, onRetry }) {
  return (
    <div className="or-empty or-error">
      <i className="bi bi-exclamation-triangle" aria-hidden="true" />
      <strong>{message || "Could not load this report"}</strong>
      {onRetry ? (
        <button type="button" className="or-btn" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

function KPICard({ title, value, icon, tone = "emerald" }) {
  return (
    <article className={`or-kpi tone-${tone}`}>
      <span className="or-kpi-icon" aria-hidden="true">
        <i className={`bi ${icon}`} />
      </span>
      <div>
        <p>{title}</p>
        <strong>{value == null || value === "" ? "—" : value}</strong>
      </div>
    </article>
  );
}

function StatusPill({ value, kind }) {
  return <span className={`or-pill ${kind || ""}`}>{value}</span>;
}

export default function OperationalReports() {
  const [activeTab, setActiveTab] = useState("executive");

  return (
    <div className="or-page">
      <header className="or-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Track attendance, enrollments, trainer load, and batch health across the academy.</p>
        </div>
      </header>

      <div className="or-tabs" role="tablist" aria-label="Report sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`or-tab ${activeTab === tab.id ? "is-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`bi ${tab.icon}`} aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="or-panel" role="tabpanel">
        {activeTab === "executive" && <ExecutiveTab />}
        {activeTab === "attendance" && <AttendanceTab />}
        {activeTab === "enrollment" && <EnrollmentTab />}
        {activeTab === "trainer" && <TrainerTab />}
        {activeTab === "health" && <HealthTab />}
      </div>
    </div>
  );
}

function ExecutiveTab() {
  const { data, isLoading, isError, refetch, isFetched } = useOperationalSummary();

  if (isLoading) return <Loader message="Loading overview..." />;
  if (isError) return <ErrorBlock message="Failed to load overview" onRetry={refetch} />;
  if (!isFetched || !data) {
    return <EmptyBlock title="No report data" hint="Overview metrics appear once academy data is available." />;
  }

  const summary = data;
  const logs = Array.isArray(summary.recentSessionLogs) ? summary.recentSessionLogs : [];
  const hasSessions = Number(summary.totalSessionsConducted) > 0;
  const attendanceValue = hasSessions ? `${summary.overallAttendanceRate ?? 0}%` : "—";
  const teachingHours = hasSessions ? summary.totalTeachingHours ?? 0 : "—";

  return (
    <div className="or-stack">
      <div className="or-kpi-grid">
        <KPICard title="Attendance rate" value={attendanceValue} icon="bi-check-all" tone="emerald" />
        <KPICard title="Active students" value={summary.activeStudents ?? 0} icon="bi-mortarboard" tone="sky" />
        <KPICard title="Active batches" value={summary.activeBatches ?? 0} icon="bi-layers" tone="violet" />
        <KPICard title="Teaching hours" value={teachingHours} icon="bi-clock-history" tone="amber" />
      </div>

      <div className="or-grid-2">
        <section className="or-card">
          <header className="or-card-head">
            <h2>Platform snapshot</h2>
          </header>
          <div className="or-stat-tiles">
            <div><em>Students</em><strong>{summary.totalStudents ?? 0}</strong></div>
            <div><em>Trainers</em><strong>{summary.totalTrainers ?? 0}</strong></div>
            <div><em>Courses</em><strong>{summary.totalCourses ?? 0}</strong></div>
            <div><em>Batches</em><strong>{summary.totalBatches ?? 0}</strong></div>
            <div><em>Upcoming</em><strong>{summary.upcomingBatches ?? 0}</strong></div>
            <div><em>Completed</em><strong>{summary.completedBatches ?? 0}</strong></div>
            <div><em>Sessions</em><strong>{summary.totalSessionsConducted ?? 0}</strong></div>
            <div><em>Pending approvals</em><strong>{summary.pendingApprovals ?? 0}</strong></div>
          </div>
        </section>

        <section className="or-card">
          <header className="or-card-head">
            <h2>Recent class sessions</h2>
          </header>
          {logs.length === 0 ? (
            <EmptyBlock
              title="No class sessions yet"
              hint="When trainers run live classes, attendance will show up here."
            />
          ) : (
            <div className="or-table-wrap">
              <table className="or-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Batch</th>
                    <th>Trainer</th>
                    <th>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.date ? new Date(log.date).toLocaleDateString() : "—"}</td>
                      <td>{log.batchName}</td>
                      <td>{log.trainerName}</td>
                      <td>
                        <StatusPill
                          value={`${log.attendanceRate}%`}
                          kind={log.attendanceRate >= 75 ? "ok" : log.attendanceRate >= 50 ? "warn" : "bad"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function AttendanceTab() {
  const { data, isLoading, isError, refetch } = useAttendanceAnalytics();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      await downloadAttendanceCSV();
    } catch {
      alert("Failed to export attendance logs.");
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) return <Loader message="Loading attendance..." />;
  if (isError) return <ErrorBlock message="Failed to load attendance" onRetry={refetch} />;
  if (!data) {
    return <EmptyBlock title="No attendance data" hint="Attendance metrics appear after class sessions are recorded." />;
  }

  const trend = Array.isArray(data.trendOverTime) ? data.trendOverTime : [];
  const atRisk = Array.isArray(data.atRiskStudents) ? data.atRiskStudents : [];
  const recorded = Number(data.summary?.totalRecordedAttendances || 0);

  return (
    <div className="or-stack">
      <div className="or-toolbar">
        <p>Attendance trends and students who need follow-up.</p>
        <button
          type="button"
          className="or-btn or-btn-primary"
          onClick={handleExport}
          disabled={exporting || recorded === 0}
        >
          <i className="bi bi-download" aria-hidden="true" />
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </div>

      <section className="or-card">
        <header className="or-card-head">
          <h2>Attendance trend</h2>
        </header>
        {trend.length === 0 ? (
          <EmptyBlock title="No attendance trend yet" hint="Mark attendance in live classes to build this chart." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="orAtt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="attendanceRate" stroke="#10B981" fill="url(#orAtt)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="or-card">
        <header className="or-card-head">
          <h2>At-risk students (&lt; 75%)</h2>
        </header>
        {recorded === 0 ? (
          <EmptyBlock title="No attendance records yet" hint="At-risk students appear after enough sessions are marked." />
        ) : atRisk.length === 0 ? (
          <EmptyBlock title="No at-risk students" hint="No student is currently below 75% attendance." />
        ) : (
          <div className="or-table-wrap">
            <table className="or-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Batch</th>
                  <th>Attendance</th>
                  <th>P / L / A</th>
                </tr>
              </thead>
              <tbody>
                {atRisk.map((s) => (
                  <tr key={s.studentId}>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.email}</td>
                    <td>{s.batchName}</td>
                    <td><StatusPill value={`${s.attendancePercentage}%`} kind="bad" /></td>
                    <td className="or-muted">P:{s.present} L:{s.late} A:{s.absent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function EnrollmentTab() {
  const { data, isLoading, isError, refetch } = useEnrollmentAnalytics();

  const handleExport = () => {
    const rows = (Array.isArray(data?.courseDistribution) ? data.courseDistribution : []).filter(
      (c) => Number(c.totalEnrollments) > 0
    );
    if (!rows.length) return;
    exportToCSV("Enrollment_Analytics", [
      ["Course Name", "Total Enrollments", "Active", "Completed", "Completion Rate %"],
      ...rows.map((c) => [
        c.courseName,
        c.totalEnrollments,
        c.activeCount,
        c.completedCount,
        c.completionRate,
      ]),
    ]);
  };

  if (isLoading) return <Loader message="Loading enrollment..." />;
  if (isError) return <ErrorBlock message="Failed to load enrollment" onRetry={refetch} />;
  if (!data) {
    return <EmptyBlock title="No enrollment data" hint="Enrollment analytics appear after students join courses." />;
  }

  const trends = (Array.isArray(data.trends) ? data.trends : []).filter((t) => Number(t.value) > 0);
  const courses = (Array.isArray(data.courseDistribution) ? data.courseDistribution : []).filter(
    (c) => Number(c.totalEnrollments) > 0
  );
  const funnel = (Array.isArray(data.conversionFunnel) ? data.conversionFunnel : []).filter(
    (stage) => Number(stage.count) > 0
  );

  return (
    <div className="or-stack">
      <div className="or-toolbar">
        <p>Enrollment growth and course completion.</p>
        <button type="button" className="or-btn" onClick={handleExport} disabled={!courses.length}>
          <i className="bi bi-download" aria-hidden="true" />
          Export CSV
        </button>
      </div>

      {funnel.length > 0 && (
        <div className="or-kpi-grid">
          {funnel.map((stage) => (
            <KPICard
              key={stage.stage}
              title={stage.stage}
              value={stage.count}
              icon="bi-funnel"
              tone="emerald"
            />
          ))}
        </div>
      )}

      <section className="or-card">
        <header className="or-card-head">
          <h2>Enrollment growth</h2>
        </header>
        {trends.length === 0 ? (
          <EmptyBlock title="No enrollment activity yet" hint="When students enroll in courses, monthly growth appears here." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="month" tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="or-card">
        <header className="or-card-head">
          <h2>Course distribution</h2>
        </header>
        {courses.length === 0 ? (
          <EmptyBlock title="No course enrollments yet" hint="Courses with at least one enrollment will list here." />
        ) : (
          <div className="or-table-wrap">
            <table className="or-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Total</th>
                  <th>Active</th>
                  <th>Completed</th>
                  <th>Completion</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.courseId}>
                    <td>{c.courseName}</td>
                    <td>{c.totalEnrollments}</td>
                    <td>{c.activeCount}</td>
                    <td>{c.completedCount}</td>
                    <td>
                      <div className="or-progress">
                        <div className="or-progress-track">
                          <div className="or-progress-fill" style={{ width: `${c.completionRate}%` }} />
                        </div>
                        <span>{c.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function TrainerTab() {
  const { data, isLoading, isError, refetch } = useTrainerUtilization();

  const handleExport = () => {
    if (!data?.trainers?.length) return;
    exportToCSV("Trainer_Utilization", [
      ["Trainer", "Email", "Active Batches", "Completed Batches", "Sessions", "Hours", "Avg Attendance %"],
      ...data.trainers.map((t) => [
        t.name,
        t.email,
        t.activeBatchesCount,
        t.completedBatchesCount,
        t.totalSessionsConducted,
        t.totalHoursTaught,
        t.avgStudentAttendanceRate,
      ]),
    ]);
  };

  if (isLoading) return <Loader message="Loading trainers..." />;
  if (isError) return <ErrorBlock message="Failed to load trainer report" onRetry={refetch} />;
  if (!data) {
    return <EmptyBlock title="No trainer data" hint="Trainer utilization appears after trainers are added." />;
  }

  const trainers = Array.isArray(data.trainers) ? data.trainers : [];
  const summary = data.workloadSummary || {};
  const hasHours = Number(summary.totalTeachingHours) > 0;

  return (
    <div className="or-stack">
      <div className="or-kpi-grid">
        <KPICard
          title="Total hours taught"
          value={hasHours ? `${summary.totalTeachingHours} hrs` : "—"}
          icon="bi-clock"
          tone="emerald"
        />
        <KPICard
          title="Avg hours / trainer"
          value={hasHours ? `${summary.avgHoursPerTrainer ?? 0} hrs` : "—"}
          icon="bi-person-workspace"
          tone="sky"
        />
        <KPICard title="Trainers" value={trainers.length} icon="bi-people" tone="violet" />
      </div>

      <div className="or-toolbar">
        <p>Workload and student attendance by trainer.</p>
        <button type="button" className="or-btn" onClick={handleExport} disabled={!trainers.length}>
          <i className="bi bi-download" aria-hidden="true" />
          Export CSV
        </button>
      </div>

      <section className="or-card">
        {trainers.length === 0 ? (
          <EmptyBlock title="No trainers yet" hint="Add trainers to see utilization metrics." />
        ) : (
          <div className="or-table-wrap">
            <table className="or-table">
              <thead>
                <tr>
                  <th>Trainer</th>
                  <th>Active</th>
                  <th>Completed</th>
                  <th>Sessions</th>
                  <th>Hours</th>
                  <th>Avg attendance</th>
                </tr>
              </thead>
              <tbody>
                {trainers.map((t) => (
                  <tr key={t.trainerId}>
                    <td>
                      <strong>{t.name}</strong>
                      <div className="or-muted">{t.email}</div>
                    </td>
                    <td>{t.activeBatchesCount}</td>
                    <td>{t.completedBatchesCount}</td>
                    <td>{t.totalSessionsConducted}</td>
                    <td>{t.totalHoursTaught} hrs</td>
                                    <td>
                                      <StatusPill
                                        value={
                                          Number(t.totalSessionsConducted) > 0
                                            ? `${t.avgStudentAttendanceRate}%`
                                            : "—"
                                        }
                                        kind={
                                          Number(t.totalSessionsConducted) > 0
                                            ? t.avgStudentAttendanceRate >= 75
                                              ? "ok"
                                              : "warn"
                                            : "neutral"
                                        }
                                      />
                                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function HealthTab() {
  const { data, isLoading, isError, refetch } = useBatchHealth();

  if (isLoading) return <Loader message="Loading batch health..." />;
  if (isError) return <ErrorBlock message="Failed to load batch health" onRetry={refetch} />;
  if (!data) {
    return <EmptyBlock title="No batch health data" hint="Batch health appears after batches are created." />;
  }

  const batches = Array.isArray(data.batches) ? data.batches : [];
  const pieData = Object.entries(data.lifecycleBreakdown || {})
    .map(([name, value]) => ({ name, value: Number(value) || 0 }))
    .filter((d) => d.value > 0);

  return (
    <div className="or-stack">
      <div className="or-grid-2">
        <section className="or-card">
          <header className="or-card-head">
            <h2>Batch lifecycle</h2>
          </header>
          {pieData.length === 0 ? (
            <EmptyBlock title="No batches yet" hint="Create a batch to see lifecycle distribution." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} innerRadius={58} outerRadius={84} paddingAngle={4} dataKey="value" label>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </section>

        <section className="or-card">
          <header className="or-card-head">
            <h2>Status counts</h2>
          </header>
          {pieData.length === 0 ? (
            <EmptyBlock title="No status data" hint="Batch statuses will list here once batches exist." />
          ) : (
            <div className="or-stat-tiles">
              {pieData.map((item) => (
                <div key={item.name}>
                  <em>{item.name}</em>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="or-card">
        <header className="or-card-head">
          <h2>Batch health & syllabus progress</h2>
        </header>
        {batches.length === 0 ? (
          <EmptyBlock title="No batch health data" hint="Batches will appear here with attendance and progress." />
        ) : (
          <div className="or-table-wrap">
            <table className="or-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Status</th>
                  <th>Students</th>
                  <th>Sessions</th>
                  <th>Attendance</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.batchId}>
                    <td>
                      <strong>{b.name}</strong>
                      <div className="or-muted">{b.courseName}</div>
                    </td>
                    <td><StatusPill value={b.status} kind="neutral" /></td>
                    <td>{b.studentsCount}</td>
                    <td>{b.sessionsCompleted}</td>
                    <td>
                      <StatusPill
                        value={`${b.attendanceRate}%`}
                        kind={b.healthStatus === "healthy" ? "ok" : b.healthStatus === "at-risk" ? "bad" : "warn"}
                      />
                    </td>
                    <td>
                      <div className="or-progress">
                        <div className="or-progress-track">
                          <div className="or-progress-fill" style={{ width: `${b.progressPercentage}%` }} />
                        </div>
                        <span>{b.progressPercentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
