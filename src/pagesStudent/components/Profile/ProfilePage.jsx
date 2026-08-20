import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import { useStudentProfile, useUpdateStudentProfile, useChangePassword } from "../../../hooks/useStudentProfile";
import { useStudentCourses } from "../../../hooks/useStudentCourses";
import Loader from "../../../components/common/Loader/Loader";
import FileDropZone from "../../../components/common/FileDropZone/FileDropZone";
import { uploadToCloudinary } from "../../../utils/cloudinary";

import { MdPhone } from "react-icons/md";
import {
    FaEnvelope,
    FaMapMarkerAlt,
    FaUser,
    FaCalendarAlt,
    FaGraduationCap,
    FaBriefcase,
    FaIdBadge,
    FaEdit,
    FaShieldAlt,
    FaArrowLeft
} from "react-icons/fa";
import { 
    BiBook, 
    BiTimeFive, 
    BiTrophy, 
    BiCalendar,
    BiTrendingUp
} from "react-icons/bi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Swal from "sweetalert2";

const THUMB_SKIP_WORDS = new Set([
    "complete", "course", "courses", "the", "a", "an", "and",
    "of", "for", "in", "to", "with", "using", "web", "development",
]);

function getThumbLines(name) {
    const words = String(name || "Course")
        .replace(/[^a-zA-Z0-9\s]/g, " ")
        .trim()
        .split(/\s+/)
        .filter((word) => word && !THUMB_SKIP_WORDS.has(word.toLowerCase()));

    if (words.length === 0) {
        const first = String(name || "Course").trim().split(/\s+/)[0] || "Course";
        return [first.toUpperCase()];
    }

    if (words.length === 1) return [words[0].toUpperCase()];
    return [words[0].toUpperCase(), words[1].toUpperCase()];
}

function CourseThumb({ courseName }) {
    const lines = getThumbLines(courseName);

    return (
        <div className="profile-course-thumb fullstack-thumb">
            <div className="fullstack-grid" aria-hidden="true" />
            <div className="fullstack-code" aria-hidden="true">{'</>'}</div>
            <p className="profile-course-thumb-title fullstack-title">
                {lines.map((line) => (
                    <span key={line}>{line}</span>
                ))}
            </p>
        </div>
    );
}

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

    const handleImageFile = (file) => {
        if (!file) return;
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
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
                    Swal.fire({
                        icon: 'success',
                        title: 'Profile Updated',
                        text: 'Your profile has been successfully updated!',
                        confirmButtonColor: '#0F4C3A'
                    });
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
                        <p className="profile-modal-section-title">Profile Photo</p>
                        <div className="profile-input-row">
                            <FileDropZone
                                compact
                                accept="image/*"
                                hint="Drag profile photo from Google or computer"
                                onFiles={handleImageFile}
                            />
                            {previewImage && (
                                <img
                                    src={previewImage}
                                    alt="Profile preview"
                                    className="profile-photo-preview"
                                />
                            )}
                        </div>

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
                                    className="profile-input-other-gender"
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
   PROFILE HERO + DETAILS
   ============================ */
const Info = ({ profile, openEdit, openPassword }) => {
    if (!profile) return null;

    const initial = profile.name ? profile.name.charAt(0).toUpperCase() : "S";

    return (
        <>
            <div className="sp-hero-card">
                <div className="sp-hero-top">
                    <div className="sp-avatar-wrapper">
                        {profile.profileImage ? (
                            <img src={profile.profileImage} alt={profile.name} className="sp-avatar-image" />
                        ) : (
                            <div className="sp-avatar-initials">{initial}</div>
                        )}
                    </div>

                    <div className="sp-hero-identity">
                        <div className="sp-hero-name-row">
                            <h2 className="sp-profile-name">{profile.name}</h2>
                        </div>
                        <div className="sp-hero-contacts">
                            <div className="sp-info-item">
                                <FaEnvelope /> <span className="email-text">{profile.email}</span>
                            </div>
                            <div className="sp-info-item">
                                <MdPhone /> <span>{profile.phone}</span>
                            </div>
                        </div>
                    </div>

                    <div className="sp-hero-actions">
                        <button className="sp-edit-btn" onClick={openEdit}>
                            Edit Profile <FaEdit />
                        </button>
                        <button className="sp-security-btn" onClick={openPassword}>
                            Security Settings <FaShieldAlt />
                        </button>
                    </div>
                </div>

                <div className="sp-hero-stats">
                    <div className="sp-hero-stat">
                        <div className="sp-detail-icon tone-green"><FaIdBadge /></div>
                        <div className="sp-detail-content">
                            <span className="sp-detail-label">Role</span>
                            <span className="sp-detail-value">Student</span>
                        </div>
                    </div>
                    <div className="sp-hero-stat">
                        <div className="sp-detail-icon tone-purple"><FaEnvelope /></div>
                        <div className="sp-detail-content">
                            <span className="sp-detail-label">Email</span>
                            <span className="sp-detail-value email-text">{profile.email}</span>
                        </div>
                    </div>
                    <div className="sp-hero-stat">
                        <div className="sp-detail-icon tone-blue"><MdPhone /></div>
                        <div className="sp-detail-content">
                            <span className="sp-detail-label">Mobile</span>
                            <span className="sp-detail-value">{profile.phone}</span>
                        </div>
                    </div>
                    <div className="sp-hero-stat">
                        <div className="sp-detail-icon tone-orange"><FaMapMarkerAlt /></div>
                        <div className="sp-detail-content">
                            <span className="sp-detail-label">Location</span>
                            <span className="sp-detail-value">{profile.location || ""}</span>
                        </div>
                    </div>
                </div>
            </div>

            <section className="sp-details-section">
                <div className="sp-section-header">
                    <div className="sp-section-title-group">
                        <span className="sp-section-title-icon"><FaUser /></span>
                        <h2>Personal Details</h2>
                    </div>
                </div>
                <div className="sp-details-grid">
                    <div className="sp-detail-box">
                        <div className="sp-detail-icon tone-green"><FaUser /></div>
                        <div className="sp-detail-content">
                            <span className="sp-detail-label">Full Name</span>
                            <span className="sp-detail-value">{profile.name}</span>
                        </div>
                    </div>
                    <div className="sp-detail-box">
                        <div className="sp-detail-icon tone-purple"><FaEnvelope /></div>
                        <div className="sp-detail-content">
                            <span className="sp-detail-label">Email Address</span>
                            <span className="sp-detail-value email-text">{profile.email}</span>
                        </div>
                    </div>
                    <div className="sp-detail-box">
                        <div className="sp-detail-icon tone-blue"><MdPhone /></div>
                        <div className="sp-detail-content">
                            <span className="sp-detail-label">Mobile Number</span>
                            <span className="sp-detail-value">{profile.phone}</span>
                        </div>
                    </div>
                    <div className="sp-detail-box">
                        <div className="sp-detail-icon tone-orange"><FaCalendarAlt /></div>
                        <div className="sp-detail-content">
                            <span className="sp-detail-label">Date of Birth</span>
                            <span className="sp-detail-value">{profile.dob || ""}</span>
                        </div>
                    </div>
                    <div className="sp-detail-box">
                        <div className="sp-detail-icon tone-pink"><FaUser /></div>
                        <div className="sp-detail-content">
                            <span className="sp-detail-label">Gender</span>
                            <span className="sp-detail-value">{profile.gender || ""}</span>
                        </div>
                    </div>
                    <div className="sp-detail-box sp-address-box">
                        <div className="sp-detail-icon tone-green"><FaMapMarkerAlt /></div>
                        <div className="sp-detail-content">
                            <span className="sp-detail-label">Address</span>
                            <span className="sp-detail-value">{profile.location || ""}</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="sp-details-section">
                <div className="sp-section-header">
                    <div className="sp-section-title-group">
                        <span className="sp-section-title-icon"><FaBriefcase /></span>
                        <h2>Education & Employment</h2>
                    </div>
                </div>
                <div className="sp-details-grid">
                    <div className="sp-detail-box">
                        <div className="sp-detail-icon tone-teal"><FaGraduationCap /></div>
                        <div className="sp-detail-content">
                            <span className="sp-detail-label">Education</span>
                            <span className="sp-detail-value">{profile.education || ""}</span>
                        </div>
                    </div>
                    <div className="sp-detail-box">
                        <div className="sp-detail-icon tone-purple"><FaMapMarkerAlt /></div>
                        <div className="sp-detail-content">
                            <span className="sp-detail-label">University/School</span>
                            <span className="sp-detail-value">{profile.university || ""}</span>
                        </div>
                    </div>
                    <div className="sp-detail-box">
                        <div className="sp-detail-icon tone-orange"><FaBriefcase /></div>
                        <div className="sp-detail-content">
                            <span className="sp-detail-label">Profession</span>
                            <span className="sp-detail-value">{profile.jobTitle || ""}</span>
                        </div>
                    </div>
                    <div className="sp-detail-box">
                        <div className="sp-detail-icon tone-blue"><FaBriefcase /></div>
                        <div className="sp-detail-content">
                            <span className="sp-detail-label">Experience</span>
                            <span className="sp-detail-value">{profile.experience || ""}</span>
                        </div>
                    </div>
                    <div className="sp-detail-box">
                        <div className="sp-detail-icon tone-orange"><FaIdBadge /></div>
                        <div className="sp-detail-content">
                            <span className="sp-detail-label">Employment Status</span>
                            <span className="sp-detail-value">{profile.employmentStatus || ""}</span>
                        </div>
                    </div>
                    <div className="sp-detail-box sp-address-box">
                        <div className="sp-detail-icon tone-pink"><FaEdit /></div>
                        <div className="sp-detail-content">
                            <span className="sp-detail-label">Skills</span>
                            <span className="sp-detail-value">{profile.skills || ""}</span>
                        </div>
                    </div>
                </div>
            </section>
        </>
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
            <div className="profile-courses-header">
                <h2 className="profile-courses-title">My Courses</h2>
                <div className="profile-filter-tabs">
                    <button className={`profile-tab ${filter === "ongoing" ? "active" : ""}`} onClick={() => setFilter("ongoing")}>
                        Ongoing
                    </button>
                    <button className={`profile-tab ${filter === "completed" ? "active" : ""}`} onClick={() => setFilter("completed")}>
                        Completed
                    </button>
                </div>
            </div>

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
                                    <CourseThumb courseName={c.courseName || c.title} />
                                    <span className={`profile-card-badge ${isCompleted ? 'badge-completed' : 'badge-progress'}`}>
                                        {isCompleted ? "COMPLETED" : "IN PROGRESS"}
                                    </span>
                                </div>
                                <div className="profile-course-card-body">
                                    <p className="profile-course-title">{c.courseName || c.title}</p>
                                    
                                    <span className="profile-course-lessons-count">
                                        {c.completedLessons || 0} of {c.totalLessons || 0} Lessons
                                    </span>

                                    <div className="profile-card-progress-area">
                                        <div className="profile-card-progress-track">
                                            <div className="profile-card-progress-fill" style={{ width: `${progress}%` }} />
                                        </div>
                                        <div className="profile-card-progress-label">
                                            <span>{progress}% Progress</span>
                                        </div>
                                    </div>

                                    <div className="profile-card-footer">
                                        {isCompleted ? (
                                            <button className="profile-view-cert" onClick={(e) => handleCertificate(e, c)}>
                                                🎉 View Certificate
                                            </button>
                                        ) : (
                                            <span className="last-accessed-text">Last accessed recently</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {filteredCourses.length === 0 && <p className="profile-no-courses">No courses found in this category.</p>}
                </div>
            </div>
        </div>
    );
};

/* ============================
   MAIN PROFILE PAGE
   ============================ */
const ProfilePage = () => {
    const navigate = useNavigate();
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

    // Advanced Metrics for the Stats Cards Row
    const totalLessons = courses.reduce((acc, c) => acc + (c.totalLessons || 0), 0);
    const totalCompletedLessons = courses.reduce((acc, c) => acc + (c.completedLessons || 0), 0);
    const overallProgress = totalLessons > 0 ? Math.round((totalCompletedLessons / totalLessons) * 100) : 0;

    return (
        <div className="profile-root">
            <div className="profile-container-outer">
                <div className="profile-greeting-header">
                    <button
                        type="button"
                        className="sp-back-btn"
                        onClick={() => navigate('/student-dashboard')}
                        aria-label="Back"
                    >
                        <FaArrowLeft />
                    </button>
                </div>

                <Info
                    profile={profile}
                    openEdit={() => { setModalMode("edit"); setIsModelOpen(true); }}
                    openPassword={() => { setModalMode("password"); setIsModelOpen(true); }}
                />

                <div className="profile-stats-row">
                    <div className="profile-stat-card stat-ongoing">
                        <div className="stat-icon-wrapper"><BiBook /></div>
                        <div className="stat-data">
                            <span className="stat-label">Ongoing Courses</span>
                            <span className="stat-value">{ongoingCount}</span>
                            <span className="stat-subtext">Keep learning!</span>
                        </div>
                    </div>
                    <div className="profile-stat-card stat-completed">
                        <div className="stat-icon-wrapper"><BiTrophy /></div>
                        <div className="stat-data">
                            <span className="stat-label">Completed Courses</span>
                            <span className="stat-value">{completedCount}</span>
                            <span className="stat-subtext">Keep it up!</span>
                        </div>
                    </div>
                    <div className="profile-stat-card stat-lessons">
                        <div className="stat-icon-wrapper"><BiTimeFive /></div>
                        <div className="stat-data">
                            <span className="stat-label">Total Lessons</span>
                            <span className="stat-value">{totalLessons}</span>
                            <span className="stat-subtext">Across all courses</span>
                        </div>
                    </div>
                    <div className="profile-stat-card stat-progress">
                        <div className="stat-icon-wrapper"><BiTrendingUp /></div>
                        <div className="stat-data">
                            <span className="stat-label">Overall Progress</span>
                            <span className="stat-value">{overallProgress}%</span>
                            <span className="stat-subtext">Keep going strong!</span>
                        </div>
                    </div>
                </div>

                <section className="sp-details-section">
                    <CourseGrid courses={courses} profileName={profile?.name} />
                </section>
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
