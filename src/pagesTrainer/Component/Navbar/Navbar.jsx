import React from 'react';
import './Navbar.css';

const Navbar = ({ activeTab, setActiveTab }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setIsMenuOpen(false);
    };
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <button
                    className="menu-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </button>

                <div className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
                    <a
                        href="#"
                        className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
                        onClick={() => handleTabClick('home')}
                    >
                        Home
                    </a>
                    <a
                        href="#"
                        className={`nav-link ${activeTab === 'batches' ? 'active' : ''}`}
                        onClick={() => handleTabClick('batches')}
                    >
                        My Batches
                    </a>
                    <a
                        href="#"
                        className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`}
                        onClick={() => handleTabClick('courses')}
                    >
                        My Courses
                    </a>
                    <a
                        href="#"
                        className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => handleTabClick('profile')}
                    >
                        Profile
                    </a>
                </div>

                <div className="logout-container">
                    <button className="logout-btn" onClick={() => handleLogout()}>Log Out</button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
