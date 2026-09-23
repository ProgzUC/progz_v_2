import AdminLayout from "./components/AdminLayout/AdminLayout.jsx";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./AdminApp.css";
import "../styles/admin-a11y.css";
import Overview from "./components/Overview/Overview.jsx";
import Courses from "./components/Courses/Courses.jsx";
import Students from "./components/Student/Students.jsx";
import Instructors from "./components/Instructor/Instructors.jsx";
import EnrollStudents from "./components/EnrollStudent/EnrollStudents.jsx";
import BulkStudentImport from "./components/BulkImport/BulkStudentImport.jsx";
import SyncFromZen from "./components/SyncFormZen/SyncFromZen.jsx";
import ApproveUser from "./components/ApproveUser/ApproveUser.jsx";
import { CourseBuilder as CreateCourse } from "../features/course-builder";
import StudentPreview from "./components/Student/StudentPreview.jsx";
import InstructorPreview from "./components/Instructor/InstructorPreview.jsx";
import CourseView from "./components/CourseIcon/CourseView.jsx";
import EditCourse from "./components/CourseIcon/EditCourse.jsx";
import CourseTrainers from "./components/CourseIcon/CourseTrainers.jsx";
import Batches from "./components/Batches/Batches.jsx";
import ViewBatch from "./components/Batches/ViewBatch.jsx";
import RecycleBin from "./components/RecycleBin/RecycleBin.jsx";
import AttendanceReport from "./components/reports/AttendanceReport.jsx";
import OperationalReports from "./components/reports/OperationalReports.jsx";
import MonitoringDashboard from "./components/Monitoring/MonitoringDashboard.jsx";
import Settings from "./components/Settings/Settings.jsx";

// AUTH COMPONENTS (legacy — routes commented; real auth is pagesAuth/login)
// import SignIn from "./components/Sign/SignIn.jsx";
import UserEnrollment from "./components/Sign/UserEnrollment.jsx";
import UserDetailView from "./components/ApproveUser/UserDetailView.jsx";

function AdminCreateCourse() {
  const navigate = useNavigate();
  return (
    <CreateCourse
      onBack={() => navigate("/admin/courses")}
      onSave={() => navigate("/admin/courses")}
    />
  );
}

export default function AdminApp() {
  return (
      <Routes>
        {/* <Route path="/" element={<Navigate to="/overview" replace />} /> */}
        {/* AUTH ROUTES */}
        {/* <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<UserEnrollment />} /> */}




        {/* Dashboard wrapper with sidebar */}

        <Route
          path="/*"
          element={
            <AdminLayout>
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
                  <Route path="bulk-import" element={<BulkStudentImport />} />
                  <Route path="approve-users" element={<ApproveUser />} />
                  <Route path="user-detail-view" element={<UserDetailView />} />
                  <Route path="sync" element={<SyncFromZen />} />
                  <Route path="create-course" element={<AdminCreateCourse />} />
                  <Route path="add-instructor" element={<UserEnrollment subtitle="Add Instructor" />} />
                  <Route path="add-student" element={<UserEnrollment subtitle="Add Student" />} />
                  <Route path="student-preview" element={<StudentPreview />} />
                  <Route path="batches" element={<Batches />} />
                  <Route path="batches/:id" element={<ViewBatch />} />
                  <Route path="instructor-preview" element={<InstructorPreview />} />
                  <Route path="recycle-bin" element={<RecycleBin />} />
                  <Route path="monitoring" element={<MonitoringDashboard />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="reports" element={<OperationalReports />} />
                  <Route path="reports/operational" element={<OperationalReports />} />
                  <Route path="reports/attendance" element={<AttendanceReport />} />
                </Routes>
            </AdminLayout>
          }
        />

      </Routes>
  );
}
