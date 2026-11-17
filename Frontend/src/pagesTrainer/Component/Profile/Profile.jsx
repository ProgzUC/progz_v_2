import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    FaArrowLeft,
    FaEnvelope,
    FaMapMarkerAlt,
    FaUser,
    FaCalendarAlt,
    FaGraduationCap,
    FaBriefcase,
    FaEdit,
    FaCog,
    FaBell,
    FaClock,
    FaBullhorn,
    FaCheck,
    FaUndo,
    FaCode
} from 'react-icons/fa';
import { MdPhone } from 'react-icons/md';
import './Profile.css';
import { useTrainerProfile } from '../../../hooks/useTrainerProfile';
import {
    useNotificationPrefs,
    useUpdateNotificationPrefs
} from '../../../hooks/useNotifications';
import Loader from '../../../components/common/Loader/Loader';
import TrainerStatus from '../../components/TrainerStatus';
import { showError, showSuccess } from '../../../utils/toast';

const DEFAULT_PREFS = {
    inAppEnabled: true,
    emailEnabled: true,
    approvalAlerts: true,
    batchAssignment: true,
    classReminders: true,
    attendanceWarnings: true,
    adminEvents: true,
    emailDigest: true,
};

const SETTINGS_SECTIONS = [
    {
        id: 'channels',
        title: 'Notification Delivery Channels',
        icon: FaBell,
        description: 'Choose how you want to receive important notifications and alerts',
        items: [
            {
                key: 'inAppEnabled',
                label: 'In-App Bell Alerts',
                description: 'Show real-time alerts in the top navigation bell icon while active in the portal',
                badge: 'Primary',
            },
            {
                key: 'emailEnabled',
                label: 'Email Notifications',
                description: 'Send critical batch updates, reminders, and notices to your registered email address',
                badge: 'Email',
            },
        ],
    },
    {
        id: 'classroom',
        title: 'Classroom & Attendance Alerts',
        icon: FaClock,
        description: 'Live alerts for scheduled classes and student attendance thresholds',
        items: [
            {
                key: 'classReminders',
                label: 'Class Start Reminders',
                description: 'Timely reminders before your scheduled batch classes begin with join links',
            },
            {
                key: 'attendanceWarnings',
                label: 'Low Attendance Alerts (< 75%)',
                description: 'Instant notification when student attendance in your batches drops below 75%',
            },
            {
                key: 'batchAssignment',
                label: 'Batch Assignments',
                description: 'Alerts whenever you are assigned to a new batch or schedules are updated',
            },
        ],
    },
    {
        id: 'academy',
        title: 'Academy & System Notices',
        icon: FaBullhorn,
        description: 'Announcements, approvals, and academy updates from administrators',
        items: [
            {
                key: 'approvalAlerts',
                label: 'Course & Profile Approvals',
                description: 'Updates when your course curriculum or profile changes are approved or reviewed',
            },
            {
                key: 'adminEvents',
                label: 'Academy Announcements',
                description: 'Official broadcast announcements, holidays, and academy notices',
            },
            {
                key: 'emailDigest',
                label: 'Weekly Activity Digest',
                description: 'Consolidated weekly summary of student progress and upcoming lectures',
            },
        ],
    },
];

const Profile = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('section') === 'alerts' ? 'settings' : 'profile';
    const [activeTab, setActiveTab] = useState(initialTab);

    const { data: profileData, isLoading, isError, refetch } = useTrainerProfile();
    const { data: prefsData } = useNotificationPrefs(true);
    const updatePrefs = useUpdateNotificationPrefs();

    const [localPrefs, setLocalPrefs] = useState(DEFAULT_PREFS);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    // Sync tab with URL search parameter if changed
    useEffect(() => {
        if (searchParams.get('section') === 'alerts') {
            setActiveTab('settings');
        }
    }, [searchParams]);

    useEffect(() => {
        if (prefsData?.prefs) {
            setLocalPrefs(prefsData.prefs);
            setIsDirty(false);
        }
    }, [prefsData]);

    const handleToggle = (key) => {
        setLocalPrefs((prev) => {
            const next = { ...prev, [key]: !prev[key] };
            setIsDirty(true);
            return next;
        });
    };

    const handleSavePrefs = async () => {
        try {
            setIsSaving(true);
            await updatePrefs.mutateAsync(localPrefs);
            setIsDirty(false);
            setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            showSuccess('Alert preferences saved successfully');
        } catch (err) {
            showError(err.message || 'Could not save preferences');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEnableAll = () => {
        const next = Object.keys(DEFAULT_PREFS).reduce((acc, k) => {
            acc[k] = true;
            return acc;
        }, {});
        setLocalPrefs(next);
        setIsDirty(true);
    };

    const handleDisableAll = () => {
        const next = Object.keys(DEFAULT_PREFS).reduce((acc, k) => {
            acc[k] = false;
            return acc;
        }, {});
        setLocalPrefs(next);
        setIsDirty(true);
    };

    const handleReset = () => {
        setLocalPrefs(DEFAULT_PREFS);
        setIsDirty(true);
    };

    if (isLoading) {
        return <Loader message="Loading profile..." />;
    }

    if (isError || !profileData) {
        return (
            <TrainerStatus
                message="Your profile could not be loaded."
                onRetry={() => refetch()}
                onBack={() => navigate('/trainer-dashboard')}
                backLabel="Back to dashboard"
            />
        );
    }

    return (
        <div className="profile-wrapper">
            <div className="profile-container">
                {/* Header Row */}
                <div className="profile-header">
                    <button className="back-btn" onClick={() => navigate('/trainer-dashboard')} aria-label="Back">
                        <FaArrowLeft />
                    </button>
                    <h1>Trainer Profile</h1>
                </div>

                {/* Hero Card */}
                <div className="profile-hero-card">
                    <div className="hero-left-section">
                        <div className="avatar-wrapper">
                            {profileData.profileImage ? (
                                <img src={profileData.profileImage} alt={profileData.name} className="avatar-image" />
                            ) : (
                                <div className="avatar-initials">
                                    {profileData.name ? profileData.name.charAt(0) : 'T'}
                                </div>
                            )}
                        </div>

                        <div className="hero-identity">
                            <div className="hero-name-row">
                                <h2 className="profile-name">{profileData.name}</h2>
                                <span className="trainer-hero-role">
                                    <FaUser className="role-icon" />
                                    <span>{profileData.role || 'Trainer'}</span>
                                </span>
                            </div>

                            <div className="hero-contacts">
                                <div className="info-item">
                                    <FaEnvelope className="contact-icon" />
                                    <span className="email-text">{profileData.email}</span>
                                </div>
                                <span className="hero-contact-divider" aria-hidden="true">|</span>
                                <div className="info-item">
                                    <MdPhone className="contact-icon" />
                                    <span>{profileData.phone}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hero-divider" aria-hidden="true" />

                    <div className="hero-actions-section">
                        <button
                            type="button"
                            className="edit-profile-btn"
                            onClick={() => navigate('/trainer-dashboard/profile/edit')}
                        >
                            <FaEdit />
                            <span>Edit Profile</span>
                        </button>

                        <button
                            type="button"
                            className={`settings-alerts-btn ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('settings');
                                setSearchParams({ section: 'alerts' });
                            }}
                        >
                            <FaBell />
                            <span>Settings &amp; Alerts</span>
                        </button>
                    </div>
                </div>

                {/* Horizontal Underline Tabs */}
                <div className="profile-tabs-nav">
                    <button
                        type="button"
                        className={`profile-tab-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('profile');
                            setSearchParams({});
                        }}
                    >
                        <FaUser className="tab-icon" />
                        <span>Profile Details</span>
                    </button>
                    <button
                        type="button"
                        className={`profile-tab-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('settings');
                            setSearchParams({ section: 'alerts' });
                        }}
                    >
                        <FaCog className="tab-icon" />
                        <span>Settings &amp; Alert Preferences</span>
                    </button>
                </div>

                {/* TAB 1: Profile Details */}
                {activeTab === 'profile' && (
                    <div className="profile-details-stack">
                        {/* 1. Personal Information Card */}
                        <section className="profile-section-card">
                            <div className="section-card-header">
                                <FaUser className="section-header-icon" />
                                <h2>Personal Information</h2>
                            </div>

                            <div className="profile-info-grid">
                                {/* Left Column */}
                                <div className="profile-info-column">
                                    <div className="profile-info-item">
                                        <div className="profile-info-icon">
                                            <FaUser />
                                        </div>
                                        <div className="profile-info-text">
                                            <span className="profile-info-label">Full Name</span>
                                            <strong className="profile-info-value">{profileData.name || '—'}</strong>
                                        </div>
                                    </div>

                                    <div className="profile-info-item">
                                        <div className="profile-info-icon">
                                            <MdPhone />
                                        </div>
                                        <div className="profile-info-text">
                                            <span className="profile-info-label">Mobile Number</span>
                                            <strong className="profile-info-value">{profileData.phone || '—'}</strong>
                                        </div>
                                    </div>

                                    <div className="profile-info-item">
                                        <div className="profile-info-icon">
                                            <FaCalendarAlt />
                                        </div>
                                        <div className="profile-info-text">
                                            <span className="profile-info-label">Date of Birth</span>
                                            <strong className="profile-info-value">{profileData.dob || '—'}</strong>
                                        </div>
                                    </div>

                                    <div className="profile-info-item">
                                        <div className="profile-info-icon">
                                            <FaMapMarkerAlt />
                                        </div>
                                        <div className="profile-info-text">
                                            <span className="profile-info-label">Address</span>
                                            <strong className="profile-info-value">{profileData.address || '—'}</strong>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="profile-info-column">
                                    <div className="profile-info-item">
                                        <div className="profile-info-icon">
                                            <FaEnvelope />
                                        </div>
                                        <div className="profile-info-text">
                                            <span className="profile-info-label">Email</span>
                                            <strong className="profile-info-value">{profileData.email || '—'}</strong>
                                        </div>
                                    </div>

                                    <div className="profile-info-item">
                                        <div className="profile-info-icon">
                                            <MdPhone />
                                        </div>
                                        <div className="profile-info-text">
                                            <span className="profile-info-label">Alternate Mobile</span>
                                            <strong className="profile-info-value">{profileData.altPhone || '—'}</strong>
                                        </div>
                                    </div>

                                    <div className="profile-info-item">
                                        <div className="profile-info-icon">
                                            <FaUser />
                                        </div>
                                        <div className="profile-info-text">
                                            <span className="profile-info-label">Gender</span>
                                            <strong className="profile-info-value">{profileData.gender || '—'}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Education & Employment Card */}
                        <section className="profile-section-card">
                            <div className="section-card-header">
                                <FaBriefcase className="section-header-icon" />
                                <h2>Education &amp; Employment</h2>
                            </div>

                            <div className="profile-info-grid">
                                {/* Left Column */}
                                <div className="profile-info-column">
                                    <div className="profile-info-item">
                                        <div className="profile-info-icon">
                                            <FaBriefcase />
                                        </div>
                                        <div className="profile-info-text">
                                            <span className="profile-info-label">Role</span>
                                            <strong className="profile-info-value">{profileData.role || 'Trainer'}</strong>
                                        </div>
                                    </div>

                                    <div className="profile-info-item">
                                        <div className="profile-info-icon">
                                            <FaMapMarkerAlt />
                                        </div>
                                        <div className="profile-info-text">
                                            <span className="profile-info-label">University/School</span>
                                            <strong className="profile-info-value">{profileData.university || '—'}</strong>
                                        </div>
                                    </div>

                                    <div className="profile-info-item">
                                        <div className="profile-info-icon">
                                            <FaCalendarAlt />
                                        </div>
                                        <div className="profile-info-text">
                                            <span className="profile-info-label">Experience</span>
                                            <strong className="profile-info-value">{profileData.experience || '—'}</strong>
                                        </div>
                                    </div>

                                    {profileData.skills && (
                                        <div className="profile-info-item">
                                            <div className="profile-info-icon">
                                                <FaEdit />
                                            </div>
                                            <div className="profile-info-text">
                                                <span className="profile-info-label">Skills</span>
                                                <strong className="profile-info-value">{profileData.skills}</strong>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column */}
                                <div className="profile-info-column">
                                    <div className="profile-info-item">
                                        <div className="profile-info-icon">
                                            <FaGraduationCap />
                                        </div>
                                        <div className="profile-info-text">
                                            <span className="profile-info-label">Education</span>
                                            <strong className="profile-info-value">{profileData.education || '—'}</strong>
                                        </div>
                                    </div>

                                    <div className="profile-info-item">
                                        <div className="profile-info-icon">
                                            <FaCode />
                                        </div>
                                        <div className="profile-info-text">
                                            <span className="profile-info-label">Profession</span>
                                            <strong className="profile-info-value">{profileData.profession || '—'}</strong>
                                        </div>
                                    </div>

                                    <div className="profile-info-item">
                                        <div className="profile-info-icon">
                                            <FaBriefcase />
                                        </div>
                                        <div className="profile-info-text">
                                            <span className="profile-info-label">Employment Status</span>
                                            <strong className="profile-info-value">{profileData.employmentStatus || '—'}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* TAB 2: Settings & Alert Preferences */}
                {activeTab === 'settings' && (
                    <div className="profile-settings-container">
                        {/* Summary Toolbar */}
                        <div className="profile-settings-toolbar">
                            <div className="toolbar-info">
                                <span className="toolbar-badge">
                                    <FaCog /> Preferences
                                </span>
                                <h3>Alert &amp; Notification Preferences</h3>
                                <p>Manage which notifications reach your bell menu and registered email address.</p>
                            </div>

                            <div className="toolbar-actions">
                                <button
                                    type="button"
                                    className="profile-tool-btn"
                                    onClick={handleEnableAll}
                                    title="Turn on all notifications"
                                >
                                    Enable All
                                </button>
                                <button
                                    type="button"
                                    className="profile-tool-btn"
                                    onClick={handleDisableAll}
                                    title="Turn off all notifications"
                                >
                                    Disable All
                                </button>
                                <button
                                    type="button"
                                    className="profile-tool-btn"
                                    onClick={handleReset}
                                    title="Reset to default settings"
                                >
                                    <FaUndo /> Reset
                                </button>
                            </div>
                        </div>

                        {/* Setting Sections */}
                        {SETTINGS_SECTIONS.map((section) => {
                            const SectionIcon = section.icon;
                            return (
                                <section key={section.id} className="profile-section-card profile-setting-section">
                                    <div className="section-card-header">
                                        <SectionIcon className="section-header-icon" />
                                        <div>
                                            <h2>{section.title}</h2>
                                            <p className="setting-section-subtitle">{section.description}</p>
                                        </div>
                                    </div>

                                    <div className="profile-pref-grid">
                                        {section.items.map((item) => {
                                            const isChecked = localPrefs[item.key] !== false;
                                            return (
                                                <div
                                                    key={item.key}
                                                    className={`profile-pref-card ${isChecked ? 'is-enabled' : 'is-disabled'}`}
                                                    onClick={() => handleToggle(item.key)}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            handleToggle(item.key);
                                                        }
                                                    }}
                                                >
                                                    <div className="pref-card-body">
                                                        <div className="pref-card-header-row">
                                                            <strong className="pref-title">{item.label}</strong>
                                                            {item.badge && (
                                                                <span className="pref-badge">{item.badge}</span>
                                                            )}
                                                        </div>
                                                        <p className="pref-desc">{item.description}</p>
                                                    </div>

                                                    <div className="pref-card-control" onClick={(e) => e.stopPropagation()}>
                                                        <label className="profile-toggle">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => handleToggle(item.key)}
                                                                aria-label={item.label}
                                                            />
                                                            <span className="profile-toggle-knob"></span>
                                                        </label>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            );
                        })}

                        {/* Save Bar */}
                        <div className="profile-settings-footer">
                            <div className="footer-status">
                                {isDirty ? (
                                    <span className="dirty-indicator">
                                        <span className="dirty-dot"></span> Unsaved modifications
                                    </span>
                                ) : lastSaved ? (
                                    <span className="clean-indicator">
                                        <FaCheck /> Preferences saved at {lastSaved}
                                    </span>
                                ) : (
                                    <span className="neutral-indicator">
                                        All settings up to date
                                    </span>
                                )}
                            </div>

                            <div className="footer-actions">
                                {isDirty && (
                                    <button
                                        type="button"
                                        className="profile-discard-btn"
                                        onClick={() => {
                                            if (prefsData?.prefs) setLocalPrefs(prefsData.prefs);
                                            setIsDirty(false);
                                        }}
                                        disabled={isSaving}
                                    >
                                        Discard
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="profile-save-btn"
                                    onClick={handleSavePrefs}
                                    disabled={isSaving || !isDirty}
                                >
                                    {isSaving ? 'Saving…' : 'Save Preferences'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
