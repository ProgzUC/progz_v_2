import React, { useState } from "react";
import "./EnrollStudents.css";

const students = ["Sanjay", "Mezin", "Akshay", "Deepak"];
const courses = ["RPA", "AWS", "DevOps", "Azure"];
const instructors = ["John", "Mezin", "Akshay", "Deepak"];
const batches = ["Morning", "Afternoon", "Evening"];

const EnrollStudents = () => {
  const [courseSections, setCourseSections] = useState([{ id: 1 }]);

  const addCourse = () => {
    setCourseSections([...courseSections, { id: Date.now() }]);
  };

  const deleteCourse = (id) => {
    setCourseSections(courseSections.filter((sec) => sec.id !== id));
  };

  return (
    <div className="enroll-page">
      <div className="enroll-container">
        <h1 className="enroll-title">Enroll a Student</h1>

        {/* Student Info */}
        <div className="section">
          <h3 className="section-title">Students Information</h3>
          <select className="input-select">
            <option>Select student</option>
            {students.map((s, i) => (
              <option key={i}>{s}</option>
            ))}
          </select>
        </div>

        {/* Course Sections */}
        {courseSections.map((section, idx) => (
          <div key={section.id} className="section">

            <div className="title-row">
              <h3 className="section-title">Course Enrollment – {idx + 1}</h3>

              <div className="title-buttons">
                {idx === 0 && (
                  <button className="add-course-btn" onClick={addCourse}>
                    + Add Another Courses
                  </button>
                )}

                {idx !== 0 && (
                  <button
                    className="delete-icon-btn"
                    onClick={() => deleteCourse(section.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>

            <select className="input-select">
              <option>Select course</option>
              {courses.map((c, i) => (
                <option key={i}>{c}</option>
              ))}
            </select>

            <select className="input-select">
              <option>Select instructor</option>
              {instructors.map((ins, i) => (
                <option key={i}>{ins}</option>
              ))}
            </select>

            <div className="batch-container">
              <a href="#" className="create-batch-link">
                Create new batch
              </a>

              <select className="input-select">
                <option>Select batch</option>
                {batches.map((b, i) => (
                  <option key={i}>{b}</option>
                ))}
              </select>
            </div>
          </div>
        ))}

        <div className="center-btn">
          <button className="enroll-btn">Enroll Student</button>
        </div>
      </div>
    </div>
  );
};

export default EnrollStudents;
