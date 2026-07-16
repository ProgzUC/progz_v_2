import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { logout } from "../api/authApi";
import Hero from "./components/Hero";
import Courses from "./components/Courses/Courses";
import CategoryPage from "./components/Category/CategoryPage";
import ProfilePage from "./components/Profile/ProfilePage";
import CertificateView from "./components/Profile/CertificateView";
import Dashboard from "./components/mycourses/CourseCard";
import Introduction from "./components/Introduction/Introduction";
import StudentAttendance from "./components/attendance/StudentAttendance";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import CourseDetails from "./components/CourseDetails/CourseDetails";
import "./StudentGlobal.css";

export default function StudentApp() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="student-app-layout student-header">
      <Header onLogout={handleLogout} />
      <main className="student-main-content">
      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <Courses />
          </>
        } />
        <Route path="/browse" element={<CategoryPage />} />
        <Route path="/course-details" element={<CourseDetails />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/certificate" element={<CertificateView />} />
        <Route path="/my-courses" element={<Dashboard />} />
        <Route path="/my-attendance" element={<StudentAttendance />} />
      </Routes>
      </main>
      <Footer />
    </div>
  );
}
