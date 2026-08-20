import React from "react";
import { COURSE_BUILDER_STEPS, getStepMeta } from "./courseBuilderSteps";
import "./CourseBuilder.css";

export default function CourseBuilderShell({
  activeStep,
  onStepChange,
  courseName,
  children,
  footer,
}) {
  const stepMeta = getStepMeta(activeStep);

  return (
    <div className="course-builder-page">
      <div className="course-builder-layout">
        <aside className="course-builder-sidebar" aria-label="Course builder steps">
          {courseName && (
            <div className="sidebar-course-title" title={courseName}>
              {courseName}
            </div>
          )}

          <nav className="course-builder-rail-nav">
            {COURSE_BUILDER_STEPS.map((step) => (
              <button
                key={step.id}
                type="button"
                className={`sidebar-step ${activeStep === step.id ? "active" : ""}`}
                onClick={() => onStepChange(step.id)}
                title={step.label}
              >
                <span className="sidebar-step-icon">
                  <i className={`bi ${step.icon}`} />
                </span>
                <span className="sidebar-step-text">{step.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="course-builder-main">
          <header className="step-header">
            <div>
              <h2>{stepMeta.label}</h2>
              {stepMeta.subtitle && <p>{stepMeta.subtitle}</p>}
            </div>
          </header>

          <div className="step-content">
            {children}
            {footer}
          </div>
        </main>
      </div>
    </div>
  );
}
