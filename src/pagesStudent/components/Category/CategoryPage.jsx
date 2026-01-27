import React, { useState } from "react";
import "./CategoryPage.css";
import coursesData from "../courses.json";
import CourseBanner from "../CourseBanner/CourseBanner";

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


      {/* Category Tabs */}
      <div className="category-tabs-scroll">
        <div className="category-tabs">
          {categories.map((cat, index) => (
            <button
              key={index}
              className={`tab ${activeCategory === cat ? "active" : ""}`}
              onClick={() => {
                setActiveCategory(cat);
                setVisibleCount(6);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>


      {/* Course Grid */}
      <div className="course-grid">
        {visibleCourses.map((course, index) => (
          <div key={index} className="course-card">
            <img src={course.img} alt={course.title} className="course-img" />

            <div className="course-info">
              <h2 className="course-title">{course.title}</h2>
              <p className="course-desc">{course.desc}</p>

              <p className="course-roles">
                <strong>In Demand Roles:</strong> {course.roles}
              </p>

              <p className="course-salary">
                <strong>Salary Packages:</strong> {course.salary}
              </p>
            </div>

            <div className="arrow-btn">↗</div>

          </div>
        ))}
      </div>

      {/* Show More Button */}
      {visibleCount < filteredCourses.length && (
        <button className="show-more-btn" onClick={showMore}>
          Show More
        </button>
      )}
    </div>
  );
}

export default CategoryPage;
