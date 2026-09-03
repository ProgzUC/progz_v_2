import React, { useState, useMemo } from 'react';
import './OperationalReports.css';
import { 
    useOperationalSummary, 
    useAttendanceAnalytics, 
    useEnrollmentAnalytics, 
    useTrainerUtilization, 
    useBatchHealth 
} from '../../../hooks/useReports';
import { exportToCSV } from '../../../utils/csvExport';
import { downloadAttendanceCSV } from '../../../api/reportApi';
import Loader from '../../../components/common/Loader/Loader';
import { 
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    BarChart, Bar, PieChart, Pie, Cell, CartesianGrid 
} from 'recharts';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function OperationalReports() {
    const [activeTab, setActiveTab] = useState('executive');

    return (
        <div className="operational-reports-container">
            <div className="reports-header">
                <h1><i className="bi bi-graph-up-arrow"></i> Operational Analytics & Reports</h1>
                <p>Comprehensive business metrics, attendance tracking, and capacity planning.</p>
            </div>

            <div className="reports-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'executive' ? 'active' : ''}`}
                    onClick={() => setActiveTab('executive')}
                >
                    <i className="bi bi-speedometer2"></i> Executive Overview
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('attendance')}
                >
                    <i className="bi bi-calendar-check"></i> Attendance Analytics
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'enrollment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('enrollment')}
                >
                    <i className="bi bi-people"></i> Enrollment Trends
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'trainer' ? 'active' : ''}`}
                    onClick={() => setActiveTab('trainer')}
                >
                    <i className="bi bi-person-video3"></i> Trainer Utilization
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'health' ? 'active' : ''}`}
                    onClick={() => setActiveTab('health')}
                >
                    <i className="bi bi-heart-pulse"></i> Batch Health
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'executive' && <ExecutiveTab />}
                {activeTab === 'attendance' && <AttendanceTab />}
                {activeTab === 'enrollment' && <EnrollmentTab />}
                {activeTab === 'trainer' && <TrainerTab />}
                {activeTab === 'health' && <HealthTab />}
            </div>
        </div>
    );
}

// --- TAB COMPONENTS ---

function ExecutiveTab() {
    const { data, isLoading, isError } = useOperationalSummary();

    if (isLoading) return <Loader message="Loading executive summary..." />;
    if (isError || !data) return <div className="empty-state">Failed to load data.</div>;

    return (
        <div className="tab-pane">
            <div className="kpi-grid">
                <KPICard title="Platform Attendance" value={`${data.overallAttendanceRate}%`} icon="bi-check-all" type="success" />
                <KPICard title="Total Active Students" value={data.activeStudents} icon="bi-mortarboard" type="primary" />
                <KPICard title="Active Batches" value={data.activeBatches} icon="bi-layers" type="info" />
                <KPICard title="Total Teaching Hours" value={data.totalTeachingHours} icon="bi-clock-history" type="warning" />
            </div>

            <div className="chart-grid">
                <div className="chart-card">
                    <div className="card-header">
                        <h2>Recent Class Sessions</h2>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Batch</th>
                                    <th>Trainer</th>
                                    <th>Attendance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentSessionLogs?.map(log => (
                                    <tr key={log.id}>
                                        <td>{new Date(log.date).toLocaleDateString()}</td>
                                        <td>{log.batchName}</td>
                                        <td>{log.trainerName}</td>
                                        <td>
                                            <span className={`status-badge ${log.attendanceRate >= 75 ? 'healthy' : log.attendanceRate >= 50 ? 'needs-attention' : 'at-risk'}`}>
                                                {log.attendanceRate}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!data.recentSessionLogs || data.recentSessionLogs.length === 0) && (
                                    <tr><td colSpan="4" className="empty-state">No recent sessions found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="chart-card">
                    <div className="card-header">
                        <h2>Platform Distribution</h2>
                    </div>
                    <div className="kpi-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                         <div>
                             <h4 style={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Total Courses</h4>
                             <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.totalCourses}</p>
                         </div>
                         <div>
                             <h4 style={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Total Trainers</h4>
                             <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.totalTrainers}</p>
                         </div>
                         <div>
                             <h4 style={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Upcoming Batches</h4>
                             <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.upcomingBatches}</p>
                         </div>
                         <div>
                             <h4 style={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Completed Batches</h4>
                             <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.completedBatches}</p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AttendanceTab() {
    const { data, isLoading } = useAttendanceAnalytics();
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        try {
            setExporting(true);
            await downloadAttendanceCSV();
        } catch (error) {
            console.error("Export failed", error);
            alert("Failed to export attendance logs.");
        } finally {
            setExporting(false);
        }
    };

    if (isLoading) return <Loader message="Loading attendance analytics..." />;
    if (!data) return <div className="empty-state">No data available.</div>;

    return (
        <div className="tab-pane">
            <div className="filters-bar" style={{ justifyContent: 'space-between' }}>
                <div className="filter-group">
                    <p style={{ margin: 0, fontWeight: 500 }}>Overall Attendance Analytics</p>
                </div>
                <button className="action-btn primary" onClick={handleExport} disabled={exporting}>
                    <i className="bi bi-download"></i> {exporting ? 'Exporting...' : 'Export Master CSV'}
                </button>
            </div>

            <div className="chart-grid">
                <div className="chart-card full-width">
                    <div className="card-header">
                        <h2>Attendance Trend (Monthly)</h2>
                    </div>
                    {data.trendOverTime?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={data.trendOverTime}>
                                <defs>
                                    <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Area type="monotone" dataKey="attendanceRate" stroke="#10B981" fillOpacity={1} fill="url(#colorAtt)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="empty-state">No trend data available.</p>
                    )}
                </div>

                <div className="chart-card full-width">
                    <div className="card-header">
                        <h2>At-Risk Students (&lt;75% Attendance)</h2>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Email</th>
                                    <th>Batch</th>
                                    <th>Attendance %</th>
                                    <th>Status Counts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.atRiskStudents?.map(s => (
                                    <tr key={s.studentId}>
                                        <td><strong>{s.name}</strong></td>
                                        <td>{s.email}</td>
                                        <td>{s.batchName}</td>
                                        <td>
                                            <span className="status-badge at-risk">{s.attendancePercentage}%</span>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '12px', color: '#666' }}>
                                                P:{s.present} L:{s.late} A:{s.absent}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!data.atRiskStudents || data.atRiskStudents.length === 0) && (
                                    <tr><td colSpan="5" className="empty-state">No at-risk students found!</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EnrollmentTab() {
    const { data, isLoading } = useEnrollmentAnalytics();

    const handleExport = () => {
        if (!data?.courseDistribution) return;
        const rows = [
            ["Course Name", "Total Enrollments", "Active Count", "Completed Count", "Completion Rate %"],
            ...data.courseDistribution.map(c => [
                c.courseName, c.totalEnrollments, c.activeCount, c.completedCount, c.completionRate
            ])
        ];
        exportToCSV("Enrollment_Analytics", rows);
    };

    if (isLoading) return <Loader message="Loading enrollment analytics..." />;
    if (!data) return <div className="empty-state">No data available.</div>;

    return (
        <div className="tab-pane">
             <div className="filters-bar" style={{ justifyContent: 'flex-end' }}>
                <button className="action-btn" onClick={handleExport}>
                    <i className="bi bi-download"></i> Export CSV
                </button>
            </div>
            <div className="chart-grid">
                <div className="chart-card full-width">
                    <div className="card-header">
                        <h2>Enrollment Growth</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={data.trends}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="chart-card full-width">
                    <div className="card-header">
                        <h2>Course Distribution & Completion</h2>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Course</th>
                                    <th>Total Enrollments</th>
                                    <th>Active</th>
                                    <th>Completed</th>
                                    <th>Completion Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.courseDistribution?.map(c => (
                                    <tr key={c.courseId}>
                                        <td>{c.courseName}</td>
                                        <td>{c.totalEnrollments}</td>
                                        <td>{c.activeCount}</td>
                                        <td>{c.completedCount}</td>
                                        <td>
                                            <div className="progress-wrapper">
                                                <div className="progress-track">
                                                    <div className="progress-fill" style={{ width: `${c.completionRate}%` }}></div>
                                                </div>
                                                <span style={{ fontSize: '12px' }}>{c.completionRate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TrainerTab() {
    const { data, isLoading } = useTrainerUtilization();

    const handleExport = () => {
        if (!data?.trainers) return;
        const rows = [
            ["Trainer Name", "Email", "Active Batches", "Completed Batches", "Sessions Conducted", "Hours Taught", "Avg Student Attendance %"],
            ...data.trainers.map(t => [
                t.name, t.email, t.activeBatchesCount, t.completedBatchesCount, t.totalSessionsConducted, t.totalHoursTaught, t.avgStudentAttendanceRate
            ])
        ];
        exportToCSV("Trainer_Utilization", rows);
    };

    if (isLoading) return <Loader message="Loading trainer metrics..." />;
    if (!data) return <div className="empty-state">No data available.</div>;

    return (
        <div className="tab-pane">
            <div className="filters-bar" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div className="kpi-content">
                        <h3>Total Hours Taught (Platform)</h3>
                        <p className="kpi-value" style={{ fontSize: '20px' }}>{data.workloadSummary?.totalTeachingHours} hrs</p>
                    </div>
                    <div className="kpi-content">
                        <h3>Avg Hours / Trainer</h3>
                        <p className="kpi-value" style={{ fontSize: '20px' }}>{data.workloadSummary?.avgHoursPerTrainer} hrs</p>
                    </div>
                </div>
                <button className="action-btn" onClick={handleExport}>
                    <i className="bi bi-download"></i> Export CSV
                </button>
            </div>

            <div className="chart-card full-width">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Trainer Name</th>
                                <th>Active Batches</th>
                                <th>Completed Batches</th>
                                <th>Sessions</th>
                                <th>Hours Taught</th>
                                <th>Avg Student Attendance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.trainers?.map(t => (
                                <tr key={t.trainerId}>
                                    <td>
                                        <strong>{t.name}</strong><br/>
                                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{t.email}</span>
                                    </td>
                                    <td>{t.activeBatchesCount}</td>
                                    <td>{t.completedBatchesCount}</td>
                                    <td>{t.totalSessionsConducted}</td>
                                    <td>{t.totalHoursTaught} hrs</td>
                                    <td>
                                         <span className={`status-badge ${t.avgStudentAttendanceRate >= 75 ? 'healthy' : 'needs-attention'}`}>
                                             {t.avgStudentAttendanceRate}%
                                         </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function HealthTab() {
    const { data, isLoading } = useBatchHealth();

    if (isLoading) return <Loader message="Loading batch health..." />;
    if (!data) return <div className="empty-state">No data available.</div>;

    const pieData = Object.keys(data.lifecycleBreakdown || {}).map(key => ({
        name: key,
        value: data.lifecycleBreakdown[key]
    })).filter(d => d.value > 0);

    return (
        <div className="tab-pane">
            <div className="chart-grid">
                <div className="chart-card">
                    <div className="card-header">
                        <h2>Batch Lifecycle</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label>
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card full-width">
                    <div className="card-header">
                        <h2>Batch Health & Syllabus Progress</h2>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Batch</th>
                                    <th>Status</th>
                                    <th>Students</th>
                                    <th>Sessions</th>
                                    <th>Attendance</th>
                                    <th>Syllabus Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.batches?.map(b => (
                                    <tr key={b.batchId}>
                                        <td>
                                            <strong>{b.name}</strong><br/>
                                            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{b.courseName}</span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${b.status}`}>{b.status}</span>
                                        </td>
                                        <td>{b.studentsCount}</td>
                                        <td>{b.sessionsCompleted}</td>
                                        <td>
                                            <span className={`status-badge ${b.healthStatus}`}>{b.attendanceRate}%</span>
                                        </td>
                                        <td>
                                            <div className="progress-wrapper">
                                                <div className="progress-track">
                                                    <div className={`progress-fill ${b.progressPercentage < 20 ? 'danger' : 'success'}`} style={{ width: `${b.progressPercentage}%` }}></div>
                                                </div>
                                                <span style={{ fontSize: '12px' }}>{b.progressPercentage}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon, type }) {
    return (
        <div className="kpi-card">
            <div className={`kpi-icon ${type}`}>
                <i className={icon}></i>
            </div>
            <div className="kpi-content">
                <h3>{title}</h3>
                <p className="kpi-value">{value}</p>
            </div>
        </div>
    );
}
