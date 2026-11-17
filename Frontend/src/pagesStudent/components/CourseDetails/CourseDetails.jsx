import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { BiTimeFive, BiBookOpen, BiUser, BiArrowBack, BiCalendarEvent } from "react-icons/bi";
import "./CourseDetails.css";
import { useStudentCatalogCourse, useStudentCourses } from "../../../hooks/useStudentCourses";
import { formatNextClass } from "../../utils/formatNextClass";
import ImageWithFallback from "../../../components/common/ImageWithFallback/ImageWithFallback";
import Loader from "../../../components/common/Loader/Loader";
import { EmptyState, ErrorState } from "../../../components/common/PageState";

export default function CourseDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId: paramId } = useParams();
  const courseId = paramId || location.state?.course?.id || location.state?.course?.courseId;
  const { data, isLoading, isError, refetch } = useStudentCatalogCourse(courseId);
  const { data: learning } = useStudentCourses();

  if (!courseId) {
    return (
      <div className="course-details-page student-container">
        <button className="course-details-back" type="button" onClick={() => navigate("/student-dashboard/browse")}>
          <BiArrowBack /> Back
        </button>
        <EmptyState
          title="Course not found"
          message="Choose a course from the catalog to see its outline."
          actionLabel="Browse courses"
          onAction={() => navigate("/student-dashboard/browse")}
        />
      </div>
    );
  }

  if (isLoading) return <Loader message="Loading course..." />;

  const course = data?.course;
  if (isError) {
    return (
      <div className="course-details-page student-container">
        <ErrorState
          title="Course could not be loaded"
          message="This outline did not come through. You can try again or go back to the catalog."
          onRetry={() => refetch()}
          onBack={() => navigate("/student-dashboard/browse")}
          backLabel="Browse courses"
        />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-details-page student-container">
        <EmptyState
          title="Course not found"
          message="This course is no longer in the catalog."
          actionLabel="Browse courses"
          onAction={() => navigate("/student-dashboard/browse")}
        />
      </div>
    );
  }

  const enrollment = (learning?.enrolledCourses || []).find(
    (item) => String(item.courseId) === String(course.id)
  );
  const nextClassAt = enrollment?.nextClassAt || course.nextClassAt;
  const batchId = enrollment?.batchId || course.batchId;
  const continueLesson = enrollment?.continueLesson;

  const openLearning = () => {
    navigate("/student-dashboard/my-courses", {
      state: { courseId: course.id, openContinue: true },
    });
  };

  return (
    <div className="course-details-page">
      <div className="student-container">
        <button className="course-details-back" type="button" onClick={() => navigate(-1)}>
          <BiArrowBack /> Back
        </button>

        <div className="course-details-hero">
          <div className="course-details-image-wrap">
            <ImageWithFallback
              src={course.thumbnail}
              alt={course.title}
              className="course-details-image"
              fallbackText={course.title}
            />
          </div>
          <div className="course-details-info">
            <span className="course-details-category">{course.enrolled ? "Enrolled" : "Catalog"}</span>
            <h1 className="course-details-title">{course.title}</h1>
            {course.description ? <p className="course-details-desc">{course.description}</p> : null}

            <div className="course-details-meta">
              <span><BiTimeFive /> {course.durationLabel || "Self-paced"}</span>
              <span><BiBookOpen /> {course.moduleCount || 0} modules · {course.lessonCount || 0} lessons</span>
              {course.instructors?.length > 0 && (
                <span><BiUser /> {course.instructors.join(", ")}</span>
              )}
            </div>

            {course.enrolled && nextClassAt && (
              <div className="course-details-next">
                <BiCalendarEvent />
                <div>
                  <strong>Next class</strong>
                  <p>
                    {formatNextClass(nextClassAt)}
                    {course.batchName || enrollment?.batchName ? ` · ${course.batchName || enrollment.batchName}` : ""}
                  </p>
                  {continueLesson?.title ? <p>Continue from {continueLesson.title}</p> : null}
                </div>
              </div>
            )}

            <div className="course-details-actions">
              {course.enrolled ? (
                <>
                  <button type="button" className="student-btn-primary course-details-cta" onClick={openLearning}>
                    Continue learning
                  </button>
                  {batchId && (
                    <button
                      type="button"
                      className="student-btn-secondary"
                      onClick={() => navigate(`/student-dashboard/my-attendance?batchId=${batchId}`)}
                    >
                      View attendance
                    </button>
                  )}
                </>
              ) : (
                <p className="course-details-note">
                  You are not enrolled in this course yet. Your academy adds you to a batch when it starts.
                </p>
              )}
            </div>
          </div>
        </div>

        <section className="course-details-outline">
          <h2>Course outline</h2>
          {course.modules?.length ? (
            <ol className="course-details-modules">
              {course.modules.map((module, index) => (
                <li key={`${module.title}-${index}`}>
                  <p className="course-details-module-title">{module.title || `Module ${index + 1}`}</p>
                  {module.lessons?.length > 0 && (
                    <ul>
                      {module.lessons.map((lesson) => (
                        <li key={lesson}>{lesson}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className="course-details-note">Lessons will appear here once the curriculum is published.</p>
          )}
        </section>
      </div>
    </div>
  );
}
