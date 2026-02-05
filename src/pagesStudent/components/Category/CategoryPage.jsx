import React, { useState, useRef, useEffect } from "react";
import "./CategoryPage.css";
import coursesData from "../courses.json";
import CourseBanner from "../CourseBanner/CourseBanner";
import { BiTimeFive, BiBarChartAlt2, BiBriefcase, BiTrophy } from "react-icons/bi";

const categories = [
  "Programming Languages",
  "Web & App Development",
  "UI/UX Designing",
  "Clouds & DevOps",
  "Data Science",
  "Data Base",
  "Data Visualization",
  "Software Testing",
  "Net working",
  "Digital Marketing",
  "Health Care",
  "CRM"
];

function CategoryPage() {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [visibleCount, setVisibleCount] = useState(6);
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll logic
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused || isDragging) return;

    let animationFrameId;
    const scroll = () => {
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += 0.8; // Adjust speed here
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, isDragging]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const filteredCourses = coursesData.filter(
    (course) => course.category === activeCategory
  );

  const visibleCourses = filteredCourses.slice(0, visibleCount);

  const showMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <div className="category-container student-category-page">
      <CourseBanner />

      <div className="jc-header-content">
        <p className="jc-course-title">Explore <span>Categories</span></p>
        <p className="jc-course-subtitle">Deepen your expertise by diving into our specialized training paths.</p>
      </div>

      {/* Category Tabs with Auto-Scroll & Manual Control */}
      <div className="category-tabs-scroll">
        <div
          className="category-marquee-wrapper"
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleMouseUp}
          onTouchMove={handleTouchMove}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false);
            setIsDragging(false);
            handleMouseUp();
          }}
        >
          <div className="category-marquee-content">
            {/* First set of categories */}
            {categories.map((cat, index) => (
              <button
                key={`cat1-${index}`}
                className={`tab ${activeCategory === cat ? "active" : ""}`}
                onClick={() => {
                  setActiveCategory(cat);
                  setVisibleCount(6);
                }}
              >
                <div className="shine-line"></div>
                {cat}
              </button>
            ))}
            {/* Second set for seamless loop */}
            {categories.map((cat, index) => (
              <button
                key={`cat2-${index}`}
                className={`tab ${activeCategory === cat ? "active" : ""}`}
                onClick={() => {
                  setActiveCategory(cat);
                  setVisibleCount(6);
                }}
              >
                <div className="shine-line"></div>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Course Grid - Reusing jc-course-grid classes for consistency */}
      <div className="jc-course-grid">
        {visibleCourses.map((course, index) => {
          // Process roles string into array for pills
          const roleList = course.roles
            ? course.roles.replace(/^In Demand Roles:\s*/i, '').split(',').map(r => r.trim())
            : ["Fullstack Developer"];

          return (
            <div key={index} className="jc-courses-card">
              <div className="jc-card-main">
                <div className="jc-image-container">
                  <img src={course.img} alt={course.title} className="jc-course-img" />
                  <div className="jc-course-tag">6 Months</div>
                </div>

                <div className="jc-course-content">
                  <div className="jc-meta-row">
                    <span className="jc-meta-item"><BiBarChartAlt2 /> Intermediate</span>
                    <span className="jc-meta-item"><BiTimeFive /> 6 Months</span>
                  </div>

                  <p className="jc-courses-card-title">{course.title}</p>
                  <p className="jc-course-desc">{course.desc}</p>

                  <div className="jc-info-grid">
                    <div className="jc-info-item">
                      <label><BiBriefcase /> Roles:</label>
                      <div className="jc-role-tags">
                        {roleList.map((role, idx) => (
                          <span key={idx} className="jc-role-pill">{role}</span>
                        ))}
                      </div>
                    </div>
                    <div className="jc-info-item">
                      <label><BiTrophy /> Expected Salary:</label>
                      <span className="jc-salary-text">{course.salary}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More Button */}
      {visibleCount < filteredCourses.length && (
        <div className="show-more-container">
          <button className="show-more-btn" onClick={showMore}>
            Show More Courses
          </button>
        </div>
      )}
    </div>
  );
}

export default CategoryPage;
