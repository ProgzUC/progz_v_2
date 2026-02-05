import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import { useStudentProfile, useUpdateStudentProfile, useChangePassword } from "../../../hooks/useStudentProfile";
import { useStudentCourses } from "../../../hooks/useStudentCourses";
import Loader from "../../../components/common/Loader/Loader";
import ImageWithFallback from "../../../components/common/ImageWithFallback/ImageWithFallback";

import { BiPhone, BiMapPin, BiBook, BiBriefcase, BiCheckShield, BiTimeFive, BiTrophy, BiShieldQuarter } from "react-icons/bi";

/* ============================
   USER INITIALS AVATAR
   ============================ */
const UserAvatar = ({ name, imageUrl }) => {
    const initials = (name || "User")
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="profile-avatar-container">
            <div className="profile-avatar-wrapper">
                {imageUrl ? (
                    <img src={imageUrl} alt={name} className="profile-image-avatar" />
                ) : (
                    <div className="profile-initials-avatar">{initials}</div>
                )}
                <div className="verify-badge" title="Verified Student">
                    <BiCheckShield />
                </div>
            </div>
            <div className="profile-user-info">
                <p className="profile-user-name">{name}</p>
                <span className="profile-user-status">Active Student</span>
            </div>
        </div>
    );
};

/* ============================
   EDIT PROFILE MODAL COMPONENT
============================ */
const EditProfileModel = ({ currentData, mode = "edit", onClose, onSave }) => {
    const [form, setForm] = useState(currentData);
    const [currentPwdInput, setCurrentPwdInput] = useState("");
    const [newPwdInput, setNewPwdInput] = useState("");
    const [confirmPwdInput, setConfirmPwdInput] = useState("");
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [previewImage, setPreviewImage] = useState(currentData.profileImage || null);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const updateProfile = useUpdateStudentProfile();
    const changePassword = useChangePassword();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePasswordSave = () => {
        setError("");
        setSuccessMsg("");

        if (!currentPwdInput || !newPwdInput || !confirmPwdInput) {
            setError("All password fields are required.");
            return;
        }

        if (newPwdInput !== confirmPwdInput) {
            setError("New passwords do not match.");
            return;
        }

        changePassword.mutate({
            currentPassword: currentPwdInput,
            newPassword: newPwdInput
        }, {
            onSuccess: () => {
                setSuccessMsg("Password changed successfully!");
                setTimeout(() => {
                    onClose();
                }, 900);
            },
            onError: (err) => {
                setError(err?.response?.data?.message || "Failed to update password. Try again.");
            }
        });
    };

    const handleSave = () => {
        setError("");
        setSuccessMsg("");
        if (mode === "password") {
            handlePasswordSave();
            return;
        }

        const formData = new FormData();
        formData.append('phone', form.phone || "");
        formData.append('location', form.location || "");
        formData.append('education', form.education || "");
        formData.append('jobTitle', form.jobTitle || "");

        if (selectedFile) {
            formData.append('profileImage', selectedFile);
        }

        updateProfile.mutate(formData, {
            onSuccess: (updatedData) => {
                if (onSave) onSave(updatedData);
                onClose();
            },
            onError: (err) => {
                setError(err?.message || "Failed to update profile.");
            }
        });
    };

    const saving = updateProfile.isPending || changePassword.isPending;

    return (
        <div className="profile-modal-overlay" role="dialog" aria-modal="true" onClick={(e) => e.target.classList.contains('profile-modal-overlay') && onClose()}>
            <div className="profile-modal-box profile-modal-animate">
                <p className="profile-modal-title">{mode === "password" ? "Change Password" : "Edit Profile"}</p>
                {mode !== "password" && (
                    <>
                        {/* Profile Picture Section */}
                        <div className="profile-image-edit-section">
                            <div className="profile-image-preview-container">
                                {previewImage ? (
                                    <img src={previewImage} alt="Preview" className="profile-image-preview" />
                                ) : (
                                    <div className="profile-image-placeholder">
                                        {(form.name || "U")[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <button
                                className="profile-change-photo-btn"
                                onClick={() => fileInputRef.current.click()}
                                type="button"
                            >
                                Change Photo
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
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
                            <input type="text" name="jobTitle" value={form.jobTitle || ""} onChange={handleChange} />
                        </div>
                    </>
                )}
                {mode === "password" && (
                    <>
                        <div className="profile-input-row">
                            <label>Current Password</label>
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
const Info = ({ profile, ongoingCount, completedCount, openEdit, openPassword }) => {
    if (!profile) return null;

    return (
        <div className="profile-sidebar">
            <UserAvatar name={profile.name} imageUrl={profile.profileImage} />

            <div className="profile-details-card">
                <div className="profile-detail-item">
                    <div className="detail-icon"><BiPhone /></div>
                    <div className="detail-info">
                        <label>Phone</label>
                        <span>{profile.phone || "Not provided"}</span>
                    </div>
                </div>
                <div className="profile-detail-item">
                    <div className="detail-icon"><BiMapPin /></div>
                    <div className="detail-info">
                        <label>Location</label>
                        <span>{profile.location || "Not provided"}</span>
                    </div>
                </div>
                <div className="profile-detail-item">
                    <div className="detail-icon"><BiBook /></div>
                    <div className="detail-info">
                        <label>Education</label>
                        <span>{profile.education || "Not provided"}</span>
                    </div>
                </div>
                <div className="profile-detail-item">
                    <div className="detail-icon"><BiBriefcase /></div>
                    <div className="detail-info">
                        <label>Job Title</label>
                        <span>{profile.jobTitle || "Not provided"}</span>
                    </div>
                </div>
            </div>

            <div className="profile-action-btns">
                <button className="profile-btn-edit active-btn" onClick={openEdit}>
                    Edit Profile
                </button>
                <button className="profile-btn-password outline-btn" onClick={openPassword}>
                    Security Settings
                </button>
            </div>

            <div className="profile-stats-grid">
                <div className="stat-card ongoing">
                    <div className="stat-icon"><BiTimeFive /></div>
                    <div className="stat-data">
                        <span className="count">{ongoingCount}</span>
                        <span className="label">Ongoing</span>
                    </div>
                </div>
                <div className="stat-card completed">
                    <div className="stat-icon"><BiTrophy /></div>
                    <div className="stat-data">
                        <span className="count">{completedCount}</span>
                        <span className="label">Completed</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ============================
   COURSE GRID COMPONENT
============================ */
const CourseGrid = ({ courses }) => {
    const [filter, setFilter] = useState("ongoing");
    const navigate = useNavigate();

    const filteredCourses = courses.filter((course) => {
        const progress = course.progressPercentage || 0;
        if (filter === "completed") return progress === 100;
        if (filter === "ongoing") return progress < 100;
        return true;
    });

    const handleCertificate = (e) => {
        e.stopPropagation(); // Avoid navigating when clicking certificate
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
                        const progress = c.progressPercentage || 0;
                        const isCompleted = progress === 100;

                        return (
                            <div
                                key={c.courseId || c.id}
                                className="profile-course-card"
                                onClick={() => navigate('/student-dashboard/my-courses', { state: { courseId: c.courseId || c.id, fromProfile: true } })}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="profile-course-card-top">
                                    <ImageWithFallback
                                        src={c.thumbnail?.url || c.courseImage || c.img}
                                        alt={c.courseName || c.title}
                                        className="profile-card-image"
                                        fallbackText={c.courseName || c.title}
                                    />
                                    <div className="profile-card-overlay-btn">
                                        <span>{"< >"}</span>
                                    </div>
                                </div>
                                <div className="profile-course-card-body">
                                    <p className="profile-course-title">{c.courseName || c.title}</p>

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
                                            <img src="/student/lesson_icon.png" alt="lessons" className="profile-card-icon" />
                                            <span>{c.completedLessons || 0} of {c.totalLessons || 0} Lessons</span>
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
    const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useStudentProfile();
    const { data: coursesData, isLoading: coursesLoading } = useStudentCourses();

    const [isModelOpen, setIsModelOpen] = useState(false);
    const [modalMode, setModalMode] = useState("edit");

    if (profileLoading || coursesLoading) {
        return <Loader message="Loading profile..." />;
    }

    const courses = coursesData?.enrolledCourses || [];
    const completedCount = courses.filter(c => (c.progressPercentage || 0) === 100).length;
    const ongoingCount = courses.filter(c => (c.progressPercentage || 0) < 100).length;

    return (
        <div className="profile-root">
            <div className="profile-container-outer">
                <div className="profile-dashboard-card">
                    <div className="profile-banner-gradient" />
                    <div className="profile-main-layout">
                        <Info
                            profile={profile}
                            ongoingCount={ongoingCount}
                            completedCount={completedCount}
                            openEdit={() => { setModalMode("edit"); setIsModelOpen(true); }}
                            openPassword={() => { setModalMode("password"); setIsModelOpen(true); }}
                        />
                        <CourseGrid courses={courses} />
                    </div>
                </div>
            </div>

            {isModelOpen && (
                <EditProfileModel
                    currentData={profile}
                    mode={modalMode}
                    onClose={() => setIsModelOpen(false)}
                    onSave={refetchProfile}
                />
            )}
        </div>
    );
};

export default ProfilePage;

