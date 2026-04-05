import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import { useStudentProfile, useUpdateStudentProfile, useChangePassword } from "../../../hooks/useStudentProfile";
import { useStudentCourses } from "../../../hooks/useStudentCourses";
import Loader from "../../../components/common/Loader/Loader";
import ImageWithFallback from "../../../components/common/ImageWithFallback/ImageWithFallback";
import { uploadToCloudinary } from "../../../utils/cloudinary";

import { BiPhone, BiMapPin, BiBook, BiBriefcase, BiCheckShield, BiTimeFive, BiTrophy, BiShieldQuarter, BiCalendar } from "react-icons/bi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";


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
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);
    const fileInputRef = useRef(null);
    const dateInputRef = useRef(null);

    const updateProfile = useUpdateStudentProfile();
    const changePassword = useChangePassword();

    const [showOtherGender, setShowOtherGender] = useState(
        currentData.gender && !["male", "female"].includes(currentData.gender.toLowerCase())
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "dob") {
            const prevState = form.dob || "";
            let digits = value.replace(/\D/g, "");

            // If user is deleting, handle placeholders/slashes properly
            if (value.length < prevState.length) {
                const prevDigits = prevState.replace(/\D/g, "");
                // If digits didn't decrease but length did, user deleted a slash/placeholder
                if (digits.length === prevDigits.length && digits.length > 0) {
                    digits = digits.slice(0, -1);
                }
            }

            digits = digits.slice(0, 8);

            if (digits.length === 0) {
                setForm({ ...form, [name]: "" });
                return;
            }

            const template = "dd/mm/yyyy";
            let formatted = "";
            let dIdx = 0;
            for (let i = 0; i < template.length; i++) {
                if (template[i] === "/") {
                    formatted += "/";
                } else {
                    if (dIdx < digits.length) {
                        formatted += digits[dIdx++];
                    } else {
                        formatted += template[i];
                    }
                }
            }
            setForm({ ...form, [name]: formatted });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleDatePick = (e) => {
        const dateVal = e.target.value; // YYYY-MM-DD
        if (dateVal) {
            const [y, m, d] = dateVal.split("-");
            setForm({ ...form, dob: `${d}/${m}/${y}` });
        }
    };

    const handleGenderSelect = (e) => {
        const val = e.target.value;
        if (val === "other") {
            setShowOtherGender(true);
            setForm({ ...form, gender: "" });
        } else {
            setShowOtherGender(false);
            setForm({ ...form, gender: val });
        }
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
            setError("Please fill in all password fields.");
            return;
        }

        if (newPwdInput.length < 6) {
            setError("New password must be at least 6 characters long.");
            return;
        }

        if (newPwdInput !== confirmPwdInput) {
            setError("The new passwords do not match.");
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
                setError(err?.message || "Failed to update password. Try again.");
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

        // Validate Profile Fields
        if (!form.dob || !form.gender || !form.location || !form.education) {
            setError("Please fill in all required fields (DOB, Gender, Address, Education).");
            return;
        }

        // DOB Format Validation
        const dobRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        if (!dobRegex.test(form.dob)) {
            setError("Date of Birth must be in DD/MM/YYYY format.");
            return;
        }

        // Build JSON payload. Upload image to Cloudinary first if present.
        const payload = {
            location: form.location || "",
            education: form.education || "",
            jobTitle: form.jobTitle || "",

            dob: form.dob || "",
            gender: form.gender || "",
            university: form.university || "",
            experience: form.experience || "",
            employmentStatus: form.employmentStatus || "",
            skills: form.skills || "",
            zenCourseName: form.zenCourseName || "",
            zenCourseType: form.zenCourseType || "",
            source: form.source || "",
        };

        try {
            if (selectedFile) {
                const uploaded = await uploadToCloudinary(selectedFile, "profiles");
                if (uploaded && uploaded.url) payload.profileImage = uploaded.url;
            } else if (form.profileImage) {
                payload.profileImage = form.profileImage;
            }

            updateProfile.mutate(payload, {
                onSuccess: (updatedData) => {
                    if (onSave) onSave(updatedData);
                    onClose();
                },
                onError: (err) => {
                    setError(err?.message || "Failed to update profile.");
                }
            });
        } catch (uploadErr) {
            setError(uploadErr?.message || "Image upload failed. Try again.");
        }
    };

    const saving = updateProfile.isPending || changePassword.isPending;

    return (
        <div className="profile-modal-overlay" role="dialog" aria-modal="true" onClick={(e) => e.target.classList.contains('profile-modal-overlay') && onClose()}>
            <div className="profile-modal-box profile-modal-animate">
                <p className="profile-modal-title">{mode === "password" ? "Change Password" : "Edit Profile"}</p>
                {mode !== "password" && (
                    <>
                        <p className="profile-modal-section-title">Personal Details</p>
                        <div className="profile-input-row">
                            <label>Date of Birth</label>
                            <div className="dob-input-container">
                                <input
                                    type="text"
                                    name="dob"
                                    value={form.dob || ""}
                                    onChange={handleChange}
                                    placeholder="DD/MM/YYYY"
                                    maxLength="15"
                                />
                                <BiCalendar
                                    className="dob-calendar-icon"
                                    onClick={() => dateInputRef.current && dateInputRef.current.showPicker()}
                                />
                                <input
                                    type="date"
                                    ref={dateInputRef}
                                    onChange={handleDatePick}
                                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0, padding: 0, border: 'none' }}
                                />
                            </div>
                        </div>
                        <div className="profile-input-row">
                            <label>Gender</label>
                            <select
                                value={showOtherGender ? "other" : (form.gender || "").toLowerCase()}
                                onChange={handleGenderSelect}
                                className="profile-select-input"
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                            {showOtherGender && (
                                <input
                                    type="text"
                                    name="gender"
                                    value={form.gender || ""}
                                    onChange={handleChange}
                                    placeholder="Please specify"
                                    style={{ marginTop: '10px' }}
                                    autoFocus
                                />
                            )}
                        </div>
                        <div className="profile-input-row">
                            <label>Address</label>
                            <textarea name="location" value={form.location || ""} onChange={handleChange} rows="3"></textarea>
                        </div>

                        <p className="profile-modal-section-title" style={{ marginTop: '25px' }}>Education & Employment</p>
                        <div className="profile-input-row">
                            <label>Education</label>
                            <input type="text" name="education" value={form.education || ""} onChange={handleChange} />
                        </div>
                        <div className="profile-input-row">
                            <label>University/School</label>
                            <input type="text" name="university" value={form.university || ""} onChange={handleChange} />
                        </div>
                        <div className="profile-input-row">
                            <label>Profession</label>
                            <input type="text" name="jobTitle" value={form.jobTitle || ""} onChange={handleChange} />
                        </div>
                        <div className="profile-input-row">
                            <label>Experience</label>
                            <input type="text" name="experience" value={form.experience || ""} onChange={handleChange} />
                        </div>
                        <div className="profile-input-row">
                            <label>Employment Status</label>
                            <input type="text" name="employmentStatus" value={form.employmentStatus || ""} onChange={handleChange} />
                        </div>
                        <div className="profile-input-row">
                            <label>Skills</label>
                            <textarea name="skills" value={form.skills || ""} onChange={handleChange} rows="3"></textarea>
                        </div>

                        <p className="profile-modal-section-title" style={{ marginTop: '25px' }}>Additional Info</p>
                        <div className="profile-input-row">
                            <label>Zen Course Name</label>
                            <input type="text" name="zenCourseName" value={form.zenCourseName || ""} onChange={handleChange} />
                        </div>
                        <div className="profile-input-row">
                            <label>Zen Course Type</label>
                            <input type="text" name="zenCourseType" value={form.zenCourseType || ""} onChange={handleChange} />
                        </div>
                        <div className="profile-input-row">
                            <label>Source</label>
                            <input type="text" name="source" value={form.source || ""} onChange={handleChange} />
                        </div>
                    </>
                )}
                {mode === "password" && (
                    <>
                        <div className="profile-input-row">
                            <label>Current Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showCurrentPwd ? "text" : "password"}
                                    value={currentPwdInput}
                                    onChange={(e) => setCurrentPwdInput(e.target.value)}
                                    placeholder="Current password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                                >
                                    {showCurrentPwd ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                                </button>
                            </div>
                        </div>
                        <div className="profile-input-row">
                            <label>New Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showNewPwd ? "text" : "password"}
                                    value={newPwdInput}
                                    onChange={(e) => setNewPwdInput(e.target.value)}
                                    placeholder="New password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowNewPwd(!showNewPwd)}
                                >
                                    {showNewPwd ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                                </button>
                            </div>
                        </div>
                        <div className="profile-input-row">
                            <label>Re-enter Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showConfirmPwd ? "text" : "password"}
                                    value={confirmPwdInput}
                                    onChange={(e) => setConfirmPwdInput(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                                >
                                    {showConfirmPwd ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                                </button>
                            </div>
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
                        <label>Address</label>
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
                        <label>Profession</label>
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
const CourseGrid = ({ courses, profileName }) => {
    const [filter, setFilter] = useState("ongoing");
    const navigate = useNavigate();

    const filteredCourses = courses.filter((course) => {
        const progress = course.progressPercentage || 0;
        if (filter === "completed") return progress === 100;
        if (filter === "ongoing") return progress < 100;
        return true;
    });

    const handleCertificate = (e, course) => {
        e.stopPropagation();
        const certData = {
            studentName: profileName,
            courseName: course.courseName || course.title,
            completionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            startDate: "January 2024" // Derive if available
        };
        navigate("/student-dashboard/certificate", { state: { certData } });
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
                                            <button className="profile-view-cert" onClick={(e) => handleCertificate(e, c)}>
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
                        <CourseGrid courses={courses} profileName={profile?.name} />
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
