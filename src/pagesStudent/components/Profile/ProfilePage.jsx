import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import { useStudentProfile, useUpdateStudentProfile, useChangePassword } from "../../../hooks/useStudentProfile";
import { useStudentCourses } from "../../../hooks/useStudentCourses";
import Loader from "../../../components/common/Loader/Loader";
import ImageWithFallback from "../../../components/common/ImageWithFallback/ImageWithFallback";
import { uploadToCloudinary } from "../../../utils/cloudinary";

/* ============================
   USER INITIALS AVATAR
============================ */
const UserAvatar = ({ name, image }) => {
    const initials = (name || "User")
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="profile-avatar-wrapper">
            {image ? (
                <img src={image} alt={name} className="profile-avatar-img" />
            ) : (
                <div className="profile-initials-avatar">{initials}</div>
            )}
        </div>
    );
};

/* ============================
   EDIT PROFILE MODAL COMPONENT
============================ */
const EditProfileModel = ({ currentData, mode = "edit", onClose, onSave }) => {
    const [form, setForm] = useState(currentData);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(currentData?.profileImage?.url || null);
    const [currentPwdInput, setCurrentPwdInput] = useState("");
    const [newPwdInput, setNewPwdInput] = useState("");
    const [confirmPwdInput, setConfirmPwdInput] = useState("");
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [uploading, setUploading] = useState(false);

    const updateProfile = useUpdateStudentProfile();
    const changePassword = useChangePassword();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
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

    const handleSave = async () => {
        setError("");
        setSuccessMsg("");
        if (mode === "password") {
            handlePasswordSave();
            return;
        }

        setUploading(true);
        try {
            let updatedForm = { ...form };

            if (selectedFile) {
                const uploadRes = await uploadToCloudinary(selectedFile, "profiles");
                if (uploadRes) {
                    updatedForm.profileImage = {
                        url: uploadRes.url,
                        publicId: uploadRes.publicId
                    };
                }
            }

            updateProfile.mutate(updatedForm, {
                onSuccess: () => {
                    onSave(updatedForm);
                    onClose();
                },
                onError: (err) => {
                    setError(err?.response?.data?.message || "Failed to update profile.");
                },
                onSettled: () => {
                    setUploading(false);
                }
            });
        } catch (err) {
            setError(err.message || "Failed to upload image.");
            setUploading(false);
        }
    };

    const saving = updateProfile.isPending || changePassword.isPending || uploading;

    return (
        <div className="profile-modal-overlay" role="dialog" aria-modal="true">
            <div className="profile-modal-box">
                <h2>{mode === "password" ? "Change Password" : "Edit Profile"}</h2>
                {mode !== "password" && (
                    <>
                        <div className="profile-edit-section">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="profile-preview-img" />
                            ) : (
                                <div className="profile-initials-avatar" style={{ width: '120px', height: '120px', fontSize: '32px' }}>
                                    {(form.name || "U")[0].toUpperCase()}
                                </div>
                            )}
                            <label className="profile-upload-label">
                                {selectedFile ? "Change Image" : "Upload Picture"}
                                <input type="file" accept="image/*" onChange={handleFileChange} />
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
const Info = ({ profile, ongoingCount, completedCount }) => {
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [modalMode, setModalMode] = useState("edit");

    if (!profile) return null;

    return (
        <div className="profile-sidebar">
            <div className="profile-header-meta">
                <UserAvatar name={profile.name} image={profile.profileImage?.url} />
            </div>

            <div className="profile-details-list">
                <div className="profile-detail-item">
                    <img src="/student/phoneicon.png" className="profile-detail-icon" alt="phone" />
                    <span className="profile-detail-text">{profile.phone || "Not provided"}</span>
                </div>
                <div className="profile-detail-item">
                    <img src="/student/location.png" className="profile-detail-icon" alt="location" />
                    <span className="profile-detail-text">{profile.location || "Not provided"}</span>
                </div>
                <div className="profile-detail-item">
                    <img src="/student/degree.png" className="profile-detail-icon" alt="degree" />
                    <span className="profile-detail-text">{profile.education || "Not provided"}</span>
                </div>
                <div className="profile-detail-item">
                    <img src="/student/job.png" className="profile-detail-icon" alt="job" />
                    <span className="profile-detail-text">{profile.jobTitle || "Not provided"}</span>
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
                        <img src="/student/time.png" className="profile-summary-icon" alt="ongoing" />
                        <span>Ongoing Courses</span>
                    </div>
                    <span className="profile-summary-count">{ongoingCount.toString().padStart(2, '0')}</span>
                </div>
                <div className="profile-summary-item">
                    <div className="profile-summary-left">
                        <img src="/student/completed.png" className="profile-summary-icon" alt="completed" />
                        <span>Completed Courses</span>
                    </div>
                    <span className="profile-summary-count">{completedCount.toString().padStart(2, '0')}</span>
                </div>
            </div>

            {isModelOpen && (
                <EditProfileModel
                    currentData={profile}
                    mode={modalMode}
                    onClose={() => setIsModelOpen(false)}
                    onSave={() => { }}
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
    const navigate = useNavigate();

    const filteredCourses = courses.filter((course) => {
        const progress = course.progressPercentage || 0;
        if (filter === "completed") return progress === 100;
        if (filter === "ongoing") return progress < 100;
        return true;
    });

    const handleCertificate = (e) => {
        e.stopPropagation(); // Prevent navigation when clicking certificate
        const pngUrl = "/certificate.png";
        window.open(pngUrl, '_blank');
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = "certificate.png";
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleCourseClick = (course) => {
        // Navigate to my-courses and pass the courseId to auto-select it
        navigate("/student-dashboard/my-courses", {
            state: { selectedCourseId: course.courseId || course.id }
        });
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
                                onClick={() => handleCourseClick(c)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="profile-course-card-top">
                                    <ImageWithFallback
                                        src={c.courseImage || c.img}
                                        alt={c.courseName || c.title}
                                        className="profile-card-image"
                                        fallbackText={c.courseName || c.title}
                                    />
                                    <div className="profile-card-overlay-btn">
                                        <span>{"< >"}</span>
                                    </div>
                                </div>
                                <div className="profile-course-card-body">
                                    <h3>{c.courseName || c.title}</h3>
                                    <p className="profile-card-author">{c.instructor || c.author}</p>

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
    const { data: profile, isLoading: profileLoading } = useStudentProfile();
    const { data: coursesData, isLoading: coursesLoading } = useStudentCourses();

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
                        />
                        <CourseGrid courses={courses} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
