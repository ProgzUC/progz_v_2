import { useNavigate } from 'react-router-dom';
import Active from './Batches';
import './Home.css';

const ACTIONS = [
    {
        label: 'New course',
        hint: 'Build a curriculum',
        to: '/trainer-dashboard/courses/new',
        icon: 'plus',
    },
    {
        label: 'My courses',
        hint: 'Edit what you teach',
        to: '/trainer-dashboard/courses',
        icon: 'book',
    },
    {
        label: 'My batches',
        hint: 'Open a live class',
        to: '/trainer-dashboard/batches',
        icon: 'people',
    },
    {
        label: 'Profile',
        hint: 'Your trainer details',
        to: '/trainer-dashboard/profile',
        icon: 'user',
    },
];

const STEPS = [
    { title: 'Build the course', text: 'Add modules and lessons students will follow.' },
    { title: 'Open the batch', text: 'See who is enrolled and when class meets.' },
    { title: 'Unlock lessons', text: 'Release the next section when the class is ready.' },
    { title: 'Track progress', text: 'Watch completion and keep every batch moving.' },
];

function formatWhen(iso) {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function ActionIcon({ name }) {
    const common = {
        width: 22,
        height: 22,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
    };
    if (name === 'plus') {
        return (
            <svg {...common}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
        );
    }
    if (name === 'book') {
        return (
            <svg {...common}>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
        );
    }
    if (name === 'people') {
        return (
            <svg {...common}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        );
    }
    return (
        <svg {...common}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function ProgressRing({ value }) {
    const radius = 52;
    const circ = 2 * Math.PI * radius;
    const clamped = Math.max(0, Math.min(100, Number(value) || 0));
    const offset = circ - (clamped / 100) * circ;

    return (
        <div
            className="th-ring-wrap"
            style={{ '--circ': circ, '--offset': offset }}
            role="img"
            aria-label={`Average batch progress ${clamped} percent`}
        >
            <svg viewBox="0 0 128 128" aria-hidden="true">
                <circle className="th-ring-track" cx="64" cy="64" r={radius} />
                <circle className="th-ring-value" cx="64" cy="64" r={radius} />
            </svg>
            <div className="th-ring-label">
                <strong>{clamped}%</strong>
                <span>Avg. progress</span>
            </div>
        </div>
    );
}

const Home = ({ trainer, stats, data }) => {
    const navigate = useNavigate();
    const firstName = trainer?.name?.trim().split(/\s+/)[0] || 'Trainer';
    const batches = data?.activeBatches || [];
    const upcoming = data?.upcomingClasses || [];
    const avgProgress = batches.length
        ? Math.round(batches.reduce((sum, batch) => sum + (Number(batch.completionPercentage) || 0), 0) / batches.length)
        : 0;
    const nextClass = upcoming[0];

    const statItems = [
        { value: stats?.totalStudents ?? 0, label: 'Students' },
        { value: stats?.activeBatches ?? 0, label: 'Active batches' },
        { value: stats?.completedBatches ?? 0, label: 'Completed' },
        { value: upcoming.length, label: 'Upcoming classes' },
    ];

    return (
        <div className="th-page">
            <section className="th-hero">
                <div className="th-hero-copy">
                    <p className="th-kicker">
                        <span className="th-kicker-dot" aria-hidden="true" />
                        Welcome back, {firstName}
                    </p>
                    <h1>
                        Lead every class.
                        <span> Keep every batch moving.</span>
                    </h1>
                    <p className="th-lead">
                        Unlock lessons, follow attendance, and see which batch needs you next — all in one studio.
                    </p>
                    <div className="th-actions">
                        <button type="button" className="th-btn th-btn-primary" onClick={() => navigate('/trainer-dashboard/courses/new')}>
                            <ActionIcon name="plus" />
                            Create course
                        </button>
                        <button type="button" className="th-btn th-btn-ghost" onClick={() => navigate('/trainer-dashboard/courses')}>
                            <ActionIcon name="book" />
                            My courses
                        </button>
                    </div>
                </div>

                <div className="th-stage" aria-hidden="true">
                    <span className="th-orbit th-orbit-a" />
                    <span className="th-orbit th-orbit-b" />
                    <article className="th-board">
                        <ProgressRing value={avgProgress} />
                        <div className="th-board-copy">
                            <p>Studio pulse</p>
                            <strong>{batches.length ? `${batches.length} live ${batches.length === 1 ? 'batch' : 'batches'}` : 'No live batch yet'}</strong>
                            <span>{stats?.totalStudents ?? 0} students across your classes</span>
                        </div>
                    </article>
                    <article className="th-float th-float-students">
                        <span className="th-float-icon"><ActionIcon name="people" /></span>
                        <div>
                            <p>Students</p>
                            <strong>{stats?.totalStudents ?? 0}</strong>
                        </div>
                    </article>
                    <article className="th-float th-float-next">
                        <p>Next class</p>
                        <strong>{nextClass?.batchName || 'Nothing scheduled'}</strong>
                        <span>{nextClass ? formatWhen(nextClass.nextClassAt) : 'It will show up here'}</span>
                    </article>
                </div>
            </section>

            <section className="th-statbar" aria-label="Trainer totals">
                {statItems.map((item) => (
                    <article key={item.label} className="th-stat">
                        <strong>{item.value}</strong>
                        <span>{item.label}</span>
                    </article>
                ))}
            </section>

            <section className="th-shortcuts" aria-label="Shortcuts">
                {ACTIONS.map((action) => (
                    <button key={action.to} type="button" className="th-shortcut" onClick={() => navigate(action.to)}>
                        <span className="th-shortcut-icon"><ActionIcon name={action.icon} /></span>
                        <span>
                            <strong>{action.label}</strong>
                            <em>{action.hint}</em>
                        </span>
                    </button>
                ))}
            </section>

            <section className="th-flow" aria-label="How teaching works">
                <div className="th-section-head">
                    <p>Your teaching flow</p>
                    <h2>Four moves that keep a class on track</h2>
                </div>
                <ol>
                    {STEPS.map((step, index) => (
                        <li key={step.title}>
                            <span>{String(index + 1).padStart(2, '0')}</span>
                            <strong>{step.title}</strong>
                            <p>{step.text}</p>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="th-workspace">
                <Active data={data} />
                <aside className="th-upcoming">
                    <div className="th-section-head">
                        <p>Coming up</p>
                        <h2>Next on your calendar</h2>
                    </div>
                    {upcoming.length === 0 ? (
                        <p className="th-empty">No class is scheduled yet. Open a batch when the timetable is ready.</p>
                    ) : (
                        <ul>
                            {upcoming.map((item) => (
                                <li key={item.batchId}>
                                    <button type="button" onClick={() => navigate(`/trainer-dashboard/batches/${item.batchId}`)}>
                                        <span className="th-when">{formatWhen(item.nextClassAt)}</span>
                                        <strong>{item.batchName}</strong>
                                        <em>{item.courseName}</em>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>
            </section>
        </div>
    );
};

export default Home;
