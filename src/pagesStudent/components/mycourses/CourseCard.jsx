import React, { useState } from "react";
import "./CourseCard.css";
import Introduction from "../Introduction/Introduction";

/* ----------------------------------------------
   PROGRESS CALCULATOR
---------------------------------------------- */
function getProgress(course) {
    let total = 0;
    let done = 0;

    Object.values(course.lessons).forEach((tab) => {
        total += tab.length;
        done += tab.filter((l) => !l.isLocked).length;
    });

    const percent = Math.round((done / total) * 100);
    return { done, total, percent };
}

/* ----------------------------------------------
   LARGE COURSE CARD (RIGHT SIDE)
---------------------------------------------- */
function LargeCourseCard({ course }) {
    const { done, total, percent } = getProgress(course);

    return (
        <div className="large-card ">
            <img className="large-thumb" src={course.image} alt={course.title} />

            <div className="large-content">
                <span className="large-category">{course.tag}</span>

                <h2 className="large-title">{course.title}</h2>
                <p className="large-author">{course.author}</p>

                <div className="large-progress-bar">
                    <div
                        className="large-progress-fill"
                        style={{ width: `${percent}%` }}
                    />
                </div>

                <div className="large-bottom-row">
                    <span className="large-percent">{percent}%</span>

                    <div className="large-lessons">
                        <i className="bi bi-book lesson-icon"></i>
                        <span>
                            {done} of {total} Lessons
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ----------------------------------------------
   TABS — DYNAMIC BUT SAME DESIGN
---------------------------------------------- */
function CourseTabs({ tabs, activeTab, setActiveTab }) {
    return (
        <div className="tabs-container">
            {tabs.map((tabName, index) => {
                const isFirst = index === 0;
                const isLast = index === tabs.length - 1;
                const isActive = activeTab === tabName;

                return (
                    <div
                        key={tabName}
                        className={`tab 
              ${isFirst ? "tab-first" : ""} 
              ${isLast ? "tab-last" : ""} 
              ${isActive ? "active" : ""}`}
                        onClick={() => setActiveTab(tabName)}
                    >
                        {tabName}
                    </div>
                );
            })}
        </div>
    );
}

function TabsDivider() {
    return <div className="tabs-horizontal-divider"></div>;
}

/* ----------------------------------------------
   LESSON ROW
---------------------------------------------- */
function LessonRow({ number, title, isLocked, onOpen }) {
    return (
        <div className="lesson-row">
            <div className="lesson-number">{number}</div>
            <div className="lesson-title">{title}</div>

            <div className="lesson-action">
                {isLocked ? (
                    <i className="bi bi-lock-fill lock-icon"></i>
                ) : (
                    <button className="open-btn" onClick={onOpen}>Open</button>
                )}
            </div>
        </div>
    );
}

/* ----------------------------------------------
   MAIN DASHBOARD
---------------------------------------------- */
export default function Dashboard() {
    const courses = [
        {
            id: 1,
            image: "/student/mycourse.png",
            tag: "Development",
            title: "Mern Stack",
            author: "Bravis",
            description: "MERN Stack from basics to advanced.",

            tabs: ["HTML", "CSS", "JavaScript"],

            lessons: {
                HTML: [
                    { number: 1, title: "Introduction of HTML", isLocked: false },
                    { number: 2, title: "HTML Text Formatting and Comments", isLocked: false },
                    { number: 3, title: "Lists, Links, and Images", isLocked: true },
                    { number: 4, title: "Tables and iframes", isLocked: true }
                ],

                CSS: [
                    { number: 1, title: "Basics of CSS", isLocked: false },
                    { number: 2, title: "Selectors and Styling", isLocked: false },
                    { number: 3, title: "Box Model and Positioning", isLocked: true },
                    { number: 4, title: "Flexbox and Grid", isLocked: true }
                ],

                JavaScript: [
                    { number: 1, title: "Introduction to JavaScript", isLocked: false },
                    { number: 2, title: "Variables, Data Types, and Operators", isLocked: false },
                    { number: 3, title: "Functions and Events", isLocked: true },
                    { number: 4, title: "DOM Manipulation", isLocked: true }
                ]
            }
        },

        {
            id: 2,
            image: "/student/mycourse2.png",
            tag: "Marketing",
            title: "Digital Marketing",
            author: "Bravis",
            description: "Grow your marketing skills.",

            tabs: ["SEO", "SEM", "Social Media"],

            lessons: {
                SEO: [
                    { number: 1, title: "Basics of SEO", isLocked: false },
                    { number: 2, title: "Keyword Research", isLocked: false },
                    { number: 3, title: "On-page Optimization", isLocked: true },
                    { number: 4, title: "Backlink Building", isLocked: true }
                ],

                SEM: [
                    { number: 1, title: "Google Ads Overview", isLocked: false },
                    { number: 2, title: "Campaign Types", isLocked: false },
                    { number: 3, title: "Targeting & Bidding", isLocked: true }
                ],

                "Social Media": [
                    { number: 1, title: "Understanding Platforms", isLocked: false },
                    { number: 2, title: "Content Strategy", isLocked: false },
                    { number: 3, title: "Analytics & Growth", isLocked: true }
                ]
            }
        },

        {
            id: 3,
            image: "/student/mycourse3.png",
            tag: "Design",
            title: "UI/UX Designing",
            author: "Bravis",
            description: "Learn UI/UX with hands-on templates and case studies.",

            tabs: ["Figma", "Prototyping", "Wireframes"],

            lessons: {
                Figma: [
                    { number: 1, title: "What is Figma?", isLocked: false },
                    { number: 2, title: "Frames, Shapes & Layers", isLocked: false },
                    { number: 3, title: "Auto Layout Basics", isLocked: true }
                ],

                Prototyping: [
                    { number: 1, title: "Prototype Fundamentals", isLocked: false },
                    { number: 2, title: "Interactions & Animations", isLocked: true }
                ],

                Wireframes: [
                    { number: 1, title: "Understanding Wireframes", isLocked: false },
                    { number: 2, title: "Low-fidelity Wireframes", isLocked: true }
                ]
            }
        }
    ];

    const [selectedCourse, setSelectedCourse] = useState(courses[0]);
    const [activeTab, setActiveTab] = useState(selectedCourse.tabs[0]);
    const [showMobileDetails, setShowMobileDetails] = useState(false);
    const [viewLesson, setViewLesson] = useState(null);

    return (
        <div className={`container-fluid student-mycourses-page ${showMobileDetails ? 'mobile-show-details' : ''}`}>
            <div className="row">

                {/* LEFT SIDE */}
                <div className="col-4 p-0">
                    <div className="left-shadow">
                        <div className="left-section">
                            <h2 className="courses-heading ms-5 mt-2">My Courses</h2>

                            <div className="card-container ms-auto mt-4 ">
                                {courses.map((course, index) => {
                                    const { done, total, percent } = getProgress(course);

                                    return (
                                        <React.Fragment key={course.id}>
                                            <div
                                                className="course-card"
                                                onClick={() => {
                                                    setSelectedCourse(course);
                                                    setActiveTab(course.tabs[0]);
                                                    setShowMobileDetails(true);
                                                    setViewLesson(null); // Reset lesson view when switching courses
                                                }}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div className="card-content">
                                                    <img
                                                        className="course-thumb"
                                                        src={course.image}
                                                        alt={course.title}
                                                    />

                                                    <div className="card-details">
                                                        <div className="tag-box">
                                                            <span className="tag-text">{course.tag}</span>
                                                        </div>

                                                        <h3 className="course-title">{course.title}</h3>
                                                        <p className="author">{course.author}</p>

                                                        <div className="progress-bar">
                                                            <div
                                                                className="progress-fill"
                                                                style={{ width: `${percent}%` }}
                                                            />
                                                        </div>

                                                        <div className="bottom-row">
                                                            <span className="percent">{percent}%</span>

                                                            <div className="lessons">
                                                                <i className="bi bi-book lesson-icon"></i>
                                                                <span className="lesson-text">
                                                                    {done} of {total} Lessons
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {index !== courses.length - 1 && (
                                                <div className="divider"></div>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="col-8 right-section">
                    {viewLesson === "Introduction of HTML" ? (
                        <div className="lesson-content-view">
                            <button
                                className="btn btn-dark mb-3"
                                onClick={() => setViewLesson(null)}
                            >
                                <i className="bi bi-arrow-left"></i> Back to Lessons
                            </button>
                            <Introduction />
                        </div>
                    ) : (
                        <>
                            <button
                                className="mobile-back-btn"
                                onClick={() => setShowMobileDetails(false)}
                            >
                                <i className="bi bi-arrow-left"></i> Back to Courses
                            </button>

                            <LargeCourseCard course={selectedCourse} />

                            <CourseTabs
                                tabs={selectedCourse.tabs}
                                activeTab={activeTab}
                                setActiveTab={(tab) => {
                                    setActiveTab(tab);
                                    setViewLesson(null);
                                }}
                            />

                            <TabsDivider />

                            {selectedCourse.lessons[activeTab].map((lesson) => (
                                <LessonRow
                                    key={lesson.number}
                                    number={lesson.number}
                                    title={lesson.title}
                                    isLocked={lesson.isLocked}
                                    onOpen={() => setViewLesson(lesson.title)}
                                />
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
