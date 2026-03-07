import './Home.css';

const Home = ({ trainer, stats, onNavigateToCreateCourse, onNavigateToMyCourses }) => {
    return (
        <section className="trainer-home home-hero">
            <div className='hero-overlay'></div>
            <div className="container">
                <div className="hero-box">
                    <h1>Welcome back,<br />{trainer?.name} 👋</h1>
                    <p>Continue your learning journey and master new skills with our expert-led courses.</p>

                    <div className="hero-btns">
                        <button type="button" className="btn-primary" onClick={onNavigateToCreateCourse}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Create New Course
                        </button>
                        <button type="button" className="btn-secondary" onClick={onNavigateToMyCourses}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            My Courses
                        </button>
                    </div>

                    
                </div>
                
            </div>
            
            <div className="hero-stats">
                        <div className="stat-item">
                            <span className="stat-label">Total Students</span>
                            <span className="stat-value">{stats?.totalStudents}</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-label">Active Batches</span>
                            <span className="stat-value">{stats?.activeBatches}</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-label">Completed Batches</span>
                            <span className="stat-value">{stats?.completedBatches}</span>
                        </div>
                    </div>
                   
            <div className="hero-scroll-hint" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                <span>Scroll for more</span>
            </div>
        </section>
    );
};

export default Home;
