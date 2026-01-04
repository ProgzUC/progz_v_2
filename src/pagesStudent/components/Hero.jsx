import React from 'react'
import './Hero.css'
import heroImage from '/student/hero.jpg';
import vector1 from '/student/vector1.png';
import vector2 from '/student/vector2.png';
import vector3 from '/student/vector3.png';

import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section
      className="hero-container"
      style={{ backgroundImage: `url(${heroImage})` }}
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
          <button className="btn btn-primary">▶ Continue Learning</button>
          <Link to="/browse" className="btn btn-ghost">📚 Browse All Courses</Link>
        </div>
      </div>

      <div className="hero-bottom-fade" />
    </section>
  );
}
