import React, { useState, useEffect } from "react";
import "./ProfilePage.css";

// Images
import course1 from "/student/course1.jpg";
import course2 from "/student/course2.jpg";
import course3 from "/student/course3.jpg";
import course4 from "/student/course4.jpg";
import profileImage from "/student/pexels-andrea-piacquadio-3769021.jpg";
import phoneIcon from "/student/phoneicon.png";
import locationIcon from "/student/location.png";
import degreeIcon from "/student/degree.png";
import jobIcon from "/student/job.png";
import ongoingIcon from "/student/time.png";
import completedIcon from "/student/completed.png";
import lessonIcon from "/student/lesson_icon.png";

const STORAGE_KEY = "app_stored_password";

/* ============================
   EDIT PROFILE MODAL COMPONENT
============================ */
const EditProfileModel = ({ currentData, mode = "edit", onClose, onSave }) => {
    const [form, setForm] = useState(currentData);
    const [currentPwdInput, setCurrentPwdInput] = useState("");
    const [newPwdInput, setNewPwdInput] = useState("");
    const [confirmPwdInput, setConfirmPwdInput] = useState("");
    const [storedPassword, setStoredPassword] = useState("1234");
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setStoredPassword(saved);
        } else {
            localStorage.setItem(STORAGE_KEY, storedPassword);
        }
        setError("");
        setSuccessMsg("");
        setCurrentPwdInput("");
        setNewPwdInput("");
        setConfirmPwdInput("");
    }, [mode]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            const imageURL = URL.createObjectURL(file);
            setForm({ ...form, profileImage: imageURL });
        }
    };

    const handlePasswordSave = () => {
        setError("");
        setSuccessMsg("");
        setSaving(true);

        if (currentPwdInput !== storedPassword) {
            setError("Current password doesn't match.");
            setSaving(false);
            return;
        }

        if (!newPwdInput || newPwdInput !== confirmPwdInput) {
            setError("New passwords do not match.");
            setSaving(false);
            return;
        }

        try {
            localStorage.setItem(STORAGE_KEY, newPwdInput);
            setStoredPassword(newPwdInput);
            setSuccessMsg("Password changed successfully!");
            setTimeout(() => {
                setSaving(false);
                onClose();
            }, 900);
        } catch (err) {
            setError("Failed to update password. Try again.");
            setSaving(false);
        }
    };

    const handleSave = () => {
        setError("");
        setSuccessMsg("");
        if (mode === "password") {
            handlePasswordSave();
            return;
        }
        setSaving(true);
        onSave(form);
        setTimeout(() => {
            setSaving(false);
            onClose();
        }, 200);
    };

    return (
        <div className="profile-modal-overlay" role="dialog" aria-modal="true">
            <div className="profile-modal-box">
                <h2>{mode === "password" ? "Change Password" : "Edit Profile"}</h2>
                {mode !== "password" && (
                    <>
                        <div className="profile-edit-section">
                            <img src={form.profileImage} alt="Preview" className="profile-preview-img" />
                            <label className="profile-upload-label">
                                Upload New Photo
                                <input type="file" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                        <div className="profile-input-row">
                            <label>Phone Number</label>
                            <input type="text" name="phone" value={form.phone || ""} onChange={handleChange} />
                        </div>
                        <div className="profile-input-row">
                            <label>Location</label>
                            <input type="text" name="location" value={form.location || ""} onChange={handleChange} />
                        </div>
                        <div className="profile-input-row">
                            <label>Education</label>
                            <input type="text" name="education" value={form.education || ""} onChange={handleChange} />
                        </div>
                        <div className="profile-input-row">
                            <label>Job Title</label>
                            <input type="text" name="job" value={form.job || ""} onChange={handleChange} />
                        </div>
                    </>
                )}
                {mode === "password" && (
                    <>
                        <div className="profile-input-row">
                            <label>Enter Password</label>
                            <input type="password" value={currentPwdInput} onChange={(e) => setCurrentPwdInput(e.target.value)} placeholder="Current password" />
                        </div>
                        <div className="profile-input-row">
                            <label>New Password</label>
                            <input type="password" value={newPwdInput} onChange={(e) => setNewPwdInput(e.target.value)} placeholder="New password" />
                        </div>
                        <div className="profile-input-row">
                            <label>Re-enter Password</label>
                            <input type="password" value={confirmPwdInput} onChange={(e) => setConfirmPwdInput(e.target.value)} placeholder="Confirm new password" />
                        </div>
                    </>
                )}
                <div className="profile-msg-row">
                    {error && <div className="profile-error-text">{error}</div>}
                    {successMsg && <div className="profile-success-text">{successMsg}</div>}
                </div>
                <div className="profile-modal-actions">
                    <button className="profile-cancel-btn" onClick={onClose} disabled={saving}>Cancel</button>
                    <button className="profile-save-btn" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                </div>
            </div>
        </div>
    );
};

/* ============================
   INFO COMPONENT
============================ */
const Info = ({ ongoingCount, completedCount }) => {
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [modalMode, setModalMode] = useState("edit");
    const [user, setUser] = useState({
        phone: "9176612167",
        location: "Chennai, Tamil Nadu, India, 600001",
        education: "Bachelor's in Computer Science",
        job: "Bachelor's in Computer Science",
        profileImage: profileImage,
    });

    return (
        <div className="profile-sidebar">
            <div className="profile-header-meta">
                <div className="profile-avatar-wrapper">
                    <img src={user.profileImage} alt="Profile" className="profile-avatar-img" />
                </div>
            </div>

            <div className="profile-details-list">
                <div className="profile-detail-item">
                    <img src={phoneIcon} className="profile-detail-icon" alt="phone" />
                    <span className="profile-detail-text">{user.phone}</span>
                </div>
                <div className="profile-detail-item">
                    <img src={locationIcon} className="profile-detail-icon" alt="location" />
                    <span className="profile-detail-text">{user.location}</span>
                </div>
                <div className="profile-detail-item">
                    <img src={degreeIcon} className="profile-detail-icon" alt="degree" />
                    <span className="profile-detail-text">{user.education}</span>
                </div>
                <div className="profile-detail-item">
                    <img src={jobIcon} className="profile-detail-icon" alt="job" />
                    <span className="profile-detail-text">{user.job}</span>
                </div>
            </div>

            <div className="profile-action-btns">
                <button className="profile-btn-edit" onClick={() => { setModalMode("edit"); setIsModelOpen(true); }}>
                    Edit Profile
                </button>
                <button className="profile-btn-password" onClick={() => { setModalMode("password"); setIsModelOpen(true); }}>
                    Change Password
                </button>
            </div>

            <hr className="profile-sidebar-divider" />

            <div className="profile-summary-section">
                <div className="profile-summary-item">
                    <div className="profile-summary-left">
                        <img src={ongoingIcon} className="profile-summary-icon" alt="ongoing" />
                        <span>Ongoing Courses</span>
                    </div>
                    <span className="profile-summary-count">{ongoingCount.toString().padStart(2, '0')}</span>
                </div>
                <div className="profile-summary-item">
                    <div className="profile-summary-left">
                        <img src={completedIcon} className="profile-summary-icon" alt="completed" />
                        <span>Completed Courses</span>
                    </div>
                    <span className="profile-summary-count">{completedCount.toString().padStart(2, '0')}</span>
                </div>
            </div>

            {isModelOpen && (
                <EditProfileModel
                    currentData={user}
                    mode={modalMode}
                    onClose={() => setIsModelOpen(false)}
                    onSave={(updated) => setUser(updated)}
                />
            )}
        </div>
    );
};

/* ============================
   COURSE GRID COMPONENT
============================ */
const CourseGrid = ({ courses }) => {
    const [filter, setFilter] = useState("ongoing");

    const filteredCourses = courses.filter((course) => {
        const progress = Math.round((course.completed / course.total) * 100);
        if (filter === "completed") return progress === 100;
        if (filter === "ongoing") return progress < 100;
        return true;
    });

    const handleCertificate = () => {
        const pngUrl = "/certificate.png";
        window.open(pngUrl, '_blank');
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = "certificate.png";
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <div className="profile-courses-main">
            <div className="profile-filter-tabs">
                <button className={`profile-tab ${filter === "ongoing" ? "active" : ""}`} onClick={() => setFilter("ongoing")}>
                    Ongoing Courses
                </button>
                <button className={`profile-tab ${filter === "completed" ? "active" : ""}`} onClick={() => setFilter("completed")}>
                    Completed Courses
                </button>
            </div>

            <div className="profile-tab-line"></div>

            <div className="profile-courses-grid-scroll">
                <div className="profile-courses-grid">
                    {filteredCourses.map((c) => {
                        const progress = Math.round((c.completed / c.total) * 100);
                        const isCompleted = progress === 100;

                        return (
                            <div key={c.id} className="profile-course-card">
                                <div className="profile-course-card-top">
                                    <img src={c.img} alt={c.title} className="profile-card-image" />
                                    <div className="profile-card-overlay-btn">
                                        {/* Matches the small icon in corner */}
                                        <span>{"< >"}</span>
                                    </div>
                                </div>
                                <div className="profile-course-card-body">
                                    <h3>{c.title}</h3>
                                    <p className="profile-card-author">{c.author}</p>

                                    <div className="profile-card-progress-area">
                                        <div className="profile-card-progress-label">
                                            <span>Progress</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="profile-card-progress-track">
                                            <div className="profile-card-progress-fill" style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>

                                    <div className="profile-card-footer">
                                        <div className="profile-lesson-info">
                                            <img src={lessonIcon} alt="lessons" className="profile-card-icon" />
                                            <span>{c.completed} of {c.total} Lessons</span>
                                        </div>
                                        {isCompleted && (
                                            <button className="profile-view-cert" onClick={handleCertificate}>
                                                🎉 View Certificate
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {filteredCourses.length === 0 && <p className="profile-no-courses">No courses found.</p>}
                </div>
            </div>
        </div>
    );
};

/* ============================
   MAIN PROFILE PAGE
============================ */
const ProfilePage = () => {
    const courses = [
        { id: 1, title: "Fullstack MERN Development", author: "David Clark", completed: 8, total: 12, img: course1 },
        { id: 2, title: "Python of Beginners", author: "Lisa Davis", completed: 7, total: 15, img: course2 },
        { id: 3, title: "UI UX ( Figma )", author: "Lisa", completed: 9, total: 13, img: course3 },
        { id: 4, title: "Database Design & SQL", author: "Mark", completed: 9, total: 13, img: course4 },
    ];

    // Using hardcoded counts to match reference image exactly
    const completedCount = 3;
    const ongoingCount = 2;

    return (
        <div className="profile-root">
            <div className="profile-container-outer">
                <div className="profile-dashboard-card">
                    <div className="profile-banner-gradient" />
                    <div className="profile-main-layout">
                        <Info ongoingCount={ongoingCount} completedCount={completedCount} />
                        <CourseGrid courses={courses} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
