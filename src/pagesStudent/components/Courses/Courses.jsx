import React from "react";
import "./Courses.css";
import { BiTimeFive, BiBarChartAlt2, BiBriefcase, BiTrophy } from "react-icons/bi";

export default function Courses() {
  const courses = [
    {
      id: "da",
      title: "Data Analytics",
      img: "/student/card1.jpg",
      desc: "Companies rely on data-driven decisions; high demand across industries. Learn to analyze, visualize, and interpret data using tools like Excel, SQL, Python, and Power BI.",
      roles: ["Data Analyst", "Business Analyst", "Data Scientist"],
      salary: "6–12 LPA",
      level: "Intermediate",
      duration: "4 Months"
    },
    {
      id: "fsd",
      title: "Fullstack Development",
      img: "/student/card2.jpg",
      desc: "Businesses need developers who can handle both client and server sides; high employability. Build complete web applications using React, Node.js, and Java.",
      roles: ["Fullstack Developer", "Frontend Developer", "Backend Developer"],
      salary: "4–10 LPA",
      level: "Beginner to Advanced",
      duration: "6 Months"
    },
    {
      id: "cc",
      title: "Cloud Computing",
      img: "/student/card3.jpg",
      desc: "Cloud adoption is accelerating; businesses need scalable, cost-efficient cloud solutions. Learn how to deploy and manage services using AWS and Azure.",
      roles: ["Cloud Engineer", "DevOps Engineer", "Cloud Architect"],
      salary: "6–18 LPA",
      level: "Advanced",
      duration: "5 Months"
    },
    {
      id: "pyai",
      title: "Python Using AI",
      img: "/student/card4.jpg",
      desc: "AI/ML is transforming industries; Python is the go-to language. Learn Python programming along with AI and machine learning basics.",
      roles: ["AI Engineer", "Machine Learning Engineer", "Python Developer"],
      salary: "6–15 LPA",
      level: "Intermediate",
      duration: "4 Months"
    },
    {
      id: "java",
      title: "JAVA Programming",
      img: "/student/card5.jpg",
      desc: "Java is widely used in enterprise applications and banking. Learn core and advanced Java concepts and frameworks like Spring Boot.",
      roles: ["Java Developer", "Software Engineer", "Backend Developer"],
      salary: "4–12 LPA",
      level: "Beginner",
      duration: "3 Months"
    },
    {
      id: "st",
      title: "Software Testing",
      img: "/student/card6.jpg",
      desc: "Every software product needs quality assurance. Learn manual and automated testing techniques using Selenium and Cypress.",
      roles: ["QA Engineer", "Automation Tester", "Test Analyst"],
      salary: "3–10 LPA",
      level: "Beginner",
      duration: "3 Months"
    }
  ];

  return (
    <section className="jc-course-section">
      <div className="student-container">
        <div className="jc-header-content">
          <p className="jc-course-title">Trending <span>Courses</span></p>
          <p className="jc-course-subtitle">Master the skills that are ruling the industry with our expert-led programs.</p>
        </div>

        <div className="jc-course-grid">
          {courses.map((course) => {
            return (
              <div key={course.id} className="jc-courses-card">
                <div className="jc-card-main">
                  <div className="jc-image-container">
                    <img src={course.img} alt={course.title} className="jc-course-img" />
                    <div className="jc-course-tag">{course.duration}</div>
                  </div>

                  <div className="jc-course-content">
                    <div className="jc-meta-row">
                      <span className="jc-meta-item"><BiBarChartAlt2 /> {course.level}</span>
                      <span className="jc-meta-item"><BiTimeFive /> {course.duration}</span>
                    </div>

                    <p className="jc-courses-card-title">{course.title}</p>
                    <p className="jc-course-desc">{course.desc}</p>

                    <div className="jc-info-grid">
                      <div className="jc-info-item">
                        <label><BiBriefcase /> Roles:</label>
                        <div className="jc-role-tags">
                          {course.roles.map((role, idx) => (
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
      </div>
    </section>
  );
}
