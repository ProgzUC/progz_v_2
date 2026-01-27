import React from "react";
import { Routes, Route } from "react-router-dom";
import Hero from "./components/Hero";
import Courses from "./components/Courses/Courses";
import CategoryPage from "./components/Category/CategoryPage";
import ProfilePage from "./components/Profile/ProfilePage";
import Dashboard from "./components/mycourses/CourseCard";
import Introduction from "./components/Introduction/Introduction";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import "./StudentGlobal.css";

export default function StudentApp() {
  return (
    <div className="student-header">
      <Header />
      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <Courses />
          </>
        } />
        <Route path="/browse" element={<CategoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/my-courses" element={<Dashboard />} />
      </Routes>
      <Footer />
    </div>
  );
}
