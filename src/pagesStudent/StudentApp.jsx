import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Hero from "./components/Hero";
import Courses from "./components/Courses/Courses";
import CategoryPage from "./components/Category/CategoryPage";
import ProfilePage from "./components/Profile/ProfilePage";
import CertificateView from "./components/Profile/CertificateView";
import Dashboard from "./components/mycourses/CourseCard";
import Introduction from "./components/Introduction/Introduction";
import StudentAttendance from "./components/attendance/StudentAttendance";

import Header from "./components/Header/Header";
import Footer from "../pagesTrainer/Component/Navbar/Footer"
import "./StudentGlobal.css";

export default function StudentApp() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');

    // Redirect to login page
    navigate('/');
  };

  return (
    <div className="student-header">
      <Header onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <Courses />
          </>
        } />
        <Route path="/browse" element={<CategoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/certificate" element={<CertificateView />} />
        <Route path="/my-courses" element={<Dashboard />} />
        <Route path="/my-attendance" element={<StudentAttendance />} />
      </Routes>
      <Footer />
    </div>
  );
}
