import React from "react";
import "./Courses.css";

export default function Courses() {
  const courses = [
    {
      title: "Data Analytics",
      img: "/student/card1.jpg",
      desc:
        "Companies rely on data-driven decisions; high demand across industries. Learn to analyze, visualize, and interpret data using tools like Excel, SQL, Python, and Power BI. Boost your career with analytics skills that drive strategy, optimize processes, and unlock insights for business growth.",
      roles: "Data Analyst, Business Analyst, Data Scientist",
      salary: "Salary Packages: 6–12 LPA (entry to mid-level)"
    },

    {
      title: "Fullstack Development",
      img: "/student/card2.jpg",
      desc:
        "Businesses need developers who can handle both client and server sides; high employability. Build complete web applications using front-end (React, Angular) and back-end (Node.js, Java, Python) technologies.",
      roles: "Fullstack Developer, Frontend Developer, Backend Developer",
      salary: "Salary Packages: 4–10 LPA (entry to mid-level)"
    },

    {
      title: "Cloud Computing",
      img: "/student/card3.jpg",
      desc:
        "Cloud adoption is accelerating; businesses need scalable, cost-efficient cloud solutions. Learn how to deploy and manage cloud services using AWS, Azure, and Google Cloud.",
      roles: "Cloud Engineer, DevOps Engineer, Cloud Architect",
      salary: "Salary Packages: 6–18 LPA (entry to mid-level)"
    },

    {
      title: "Python Using AI",
      img: "/student/card4.jpg",
      desc:
        "AI/ML is transforming industries; Python is the go-to language for AI projects. Learn Python programming along with AI and machine learning basics using libraries like TensorFlow, PyTorch, and scikit-learn.",
      roles: "AI Engineer, Machine Learning Engineer, Python Developer",
      salary: "Salary Packages: 6–15 LPA (entry to mid-level)"
    },

    {
      title: "JAVA Programming",
      img: "/student/card5.jpg",
      desc:
        "Java is widely used in enterprise applications, banking, and large-scale systems. Learn core and advanced Java concepts, object-oriented programming, and frameworks like Spring Boot.",
      roles: "Java Developer, Software Engineer, Backend Developer",
      salary: "Salary Packages: 4–12 LPA (entry to mid-level)"
    },

    {
      title: "Software Testing",
      img: "/student/card6.jpg",
      desc:
        "Every software product needs quality assurance; automation speeds up testing and reduces errors. Learn manual and automated testing techniques using Selenium, QTP, and Cypress.",
      roles: "QA Engineer, Automation Tester, Test Analyst",
      salary: "Salary Packages: 3–10 LPA (entry to mid-level)"
    }
  ];

  return (
    <section className="jc-course-section">
      <h2 className="jc-course-title">Trending Courses</h2>
      <p className="jc-course-subtitle">Master the skills that are ruling the industry.</p>

      <div className="jc-course-grid">
        {courses.map((course, index) => (
          <div key={index} className="jc-courses-card">

            <img src={course.img} alt={course.title} className="jc-course-img" />

            <button className="jc-course-btn">↗</button>

            <div className="jc-course-content">
              <h2 className="jc-courses-card-title">{course.title}</h2>

              <p className="jc-course-desc">{course.desc}</p>

              <p className="jc-course-roles">
                <strong>In Demand Roles:</strong> {course.roles}
              </p>

              <p className="jc-course-salary">{course.salary}</p>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
}
