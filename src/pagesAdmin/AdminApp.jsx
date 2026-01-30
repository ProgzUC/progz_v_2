import { ThemeProvider } from "./context/ThemeContext.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import { Routes, Route, Navigate } from "react-router-dom";
import "./AdminApp.css";
import Overview from "./components/Overview/Overview.jsx";
import Courses from "./components/Courses/Courses.jsx";
import Students from "./components/Student/Students.jsx";
import Instructors from "./components/Instructor/Instructors.jsx";
import EnrollStudents from "./components/EnrollStudent/EnrollStudents.jsx";
import SyncFromZen from "./components/SyncFormZen/SyncFromZen.jsx";
import ApproveUser from "./components/ApproveUser/ApproveUser.jsx";
import CourseBuilder from "./components/CourseBuilder/CourseBuilder.jsx";
import CreateCourse from "./components/CreateCourse/CreateCourse.jsx";
import StudentPreview from "./components/Student/StudentPreview.jsx";
import InstructorPreview from "./components/Instructor/InstructorPreview.jsx";
import CourseView from "./components/CourseIcon/CourseView.jsx";
import EditCourse from "./components/CourseIcon/EditCourse.jsx";
import CourseTrainers from "./components/CourseIcon/CourseTrainers.jsx";
import Batches from "./components/Batches/Batches.jsx";
import ViewBatch from "./components/Batches/ViewBatch.jsx";
import RecycleBin from "./components/RecycleBin/RecycleBin.jsx";
import AttendanceReport from "./components/reports/AttendanceReport.jsx";

// AUTH COMPONENTS
import SignIn from "./components/Sign/SignIn.jsx";
import UserEnrollment from "./components/Sign/UserEnrollment.jsx";
import UserDetailView from "./components/ApproveUser/UserDetailView.jsx";


export default function AdminApp() {
  return (
    <ThemeProvider>

      <Routes>
        {/* <Route path="/" element={<Navigate to="/overview" replace />} /> */}
        {/* AUTH ROUTES */}
        {/* <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<UserEnrollment />} /> */}




        {/* Dashboard wrapper with sidebar */}

        <Route
          path="/*"
          element={
            <div className="layout">
              <Sidebar />
              <div className="content">
                <Routes>
                  <Route path="/" element={<Navigate to="overview" replace />} />

                  <Route path="overview" element={<Overview />} />
                  <Route path="courses" element={<Courses />} />

                  {/* ⭐⭐ FIXED ROUTES ⭐⭐ */}
                  <Route path="course/:id" element={<CourseView />} />
                  <Route path="edit-course/:id" element={<EditCourse />} />
                  <Route path="course-users/:id" element={<CourseTrainers />} />
                  {/* -------------------------------- */}

                  <Route path="students" element={<Students />} />
                  <Route path="instructors" element={<Instructors />} />
                  <Route path="enroll" element={<EnrollStudents />} />
                  <Route path="approve-users" element={<ApproveUser />} />
                  <Route path="user-detail-view" element={<UserDetailView />} />
                  <Route path="sync" element={<SyncFromZen />} />
                  <Route path="course-builder" element={<CourseBuilder />} />
                  <Route path="create-course" element={<CreateCourse />} />
                  <Route path="add-instructor" element={<UserEnrollment subtitle="Add Instructor" />} />
                  <Route path="add-student" element={<UserEnrollment subtitle="Add Student" />} />
                  <Route path="student-preview" element={<StudentPreview />} />
                  <Route path="batches" element={<Batches />} />
                  <Route path="batches/:id" element={<ViewBatch />} />
                  <Route path="instructor-preview" element={<InstructorPreview />} />
                  <Route path="recycle-bin" element={<RecycleBin />} />
                  <Route path="reports/attendance" element={<AttendanceReport />} />
                </Routes>
              </div>
            </div>
          }
        />

      </Routes>

    </ThemeProvider>
  );
}
