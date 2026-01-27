import React from 'react'
import './Hero.css'
import heroImage from '/student/hero.jpg';
import vector1 from '/student/vector1.png';
import vector2 from '/student/vector2.png';
import vector3 from '/student/vector3.png';

import { Link } from 'react-router-dom';
import { FaPlay } from "react-icons/fa";
import { TbBook } from "react-icons/tb";

export default function Hero() {
  return (
    <section
      className="hero-container student-hero-section"
      style={{ '--hero-bg': `url(${heroImage})` }}
    >
      <div className="hero-overlay" />

      {/* Decorative Vectors */}
      <div
        className="vector vector-1"
        style={{ backgroundImage: `url(${vector1})` }}
      />

      <div
        className="vector vector-2"
        style={{ backgroundImage: `url(${vector2})` }}
      />

      <div
        className="vector vector-3"
        style={{ backgroundImage: `url(${vector3})` }}
      />

      <div className="hero-content">
        <h1>
          Unlock Your Potential
          <br />
          with Expert-Led Online
          <br />
          Courses
        </h1>

        <p className="hero-sub">
          Continue your learning journey and master new skills with our expert-led courses.
        </p>

        <div className="hero-buttons">
          {/* Replaced by absolute positioned buttons below */}
        </div>
      </div>

      {/* Button 1: Continue Learning */}
      <Link to="/student-dashboard/my-courses" className="student-hero-btn continue-learning-btn">
        <div className="btn-icon">
          <FaPlay className="icon-svg" />
        </div>
        <span className="btn-text">Continue Learning</span>
      </Link>

      {/* Button 2: Browse All Courses */}
      <Link to="/student-dashboard/browse" className="student-hero-btn browse-all-btn">
        <div className="btn-icon">
          <TbBook className="icon-svg" />
        </div>
        <span className="btn-text">Browse All Courses</span>
      </Link>


      <div className="hero-bottom-fade" />
    </section >
  );
}
