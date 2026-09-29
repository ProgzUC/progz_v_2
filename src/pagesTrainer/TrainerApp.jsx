import React from 'react'
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import Navbar from './Component/Navbar/Navbar'
import Home from './Component/Home/Home'
import MyCourses from './Component/MyCourses/MyCourses'
import CourseView from './Component/MyCourses/CourseView'
import { CourseBuilder } from '../features/course-builder'
import MyBatchs from './Component/MyBatchs/MyBatchs'
import BatchDetails from './Component/MyBatchs/BatchDetails'
import Profile from './Component/Profile/Profile'
import EditProfile from './Component/Profile/EditProfile'
import './TrainerGlobal.css'
import './TrainerApp.css'
import { useTrainerBootstrap } from '../hooks/useTrainerBootstrap'
import { useCourse } from '../hooks/useCourses'
import Loader from '../components/common/Loader/Loader'
import TrainerStatus from './components/TrainerStatus'
import AnnouncementBanner from '../components/common/AnnouncementBanner/AnnouncementBanner'

function Dashboard() {
  const { data, isLoading, isError, refetch } = useTrainerBootstrap();

  if (isLoading) return <Loader message="Loading dashboard..." />;
  if (isError || !data) {
    return (
      <TrainerStatus
        message="The dashboard could not be loaded."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <>
      <Home trainer={data.trainer} stats={data.stats} data={data} />
    </>
  );
}

function EditCoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isLoading, isError, refetch } = useCourse(courseId);
  const backToCourse = () => navigate(`/trainer-dashboard/courses/${courseId}`);

  if (isLoading) return <Loader message="Loading course..." />;
  if (isError) {
    return (
      <TrainerStatus
        message="This course could not be loaded."
        onRetry={() => refetch()}
        onBack={() => navigate('/trainer-dashboard/courses')}
        backLabel="Back to courses"
      />
    );
  }

  return (
    <CourseBuilder
      isEditMode
      courseIdToEdit={courseId}
      onBack={backToCourse}
      onSave={backToCourse}
    />
  );
}

function CreateCoursePage() {
  const navigate = useNavigate();
  const backToCourses = () => navigate('/trainer-dashboard/courses');

  return (
    <CourseBuilder
      onBack={backToCourses}
      onSave={backToCourses}
    />
  );
}

function TrainerApp() {
  return (
    <div className="trainer-app">
      <Navbar />
      <AnnouncementBanner source="trainer" />
      <main className="main-content">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="batches" element={<MyBatchs />} />
          <Route path="batches/:batchId" element={<BatchDetails />} />
          <Route path="courses" element={<MyCourses />} />
          <Route path="courses/new" element={<CreateCoursePage />} />
          <Route path="courses/:courseId/edit" element={<EditCoursePage />} />
          <Route path="courses/:courseId" element={<CourseView />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="*" element={<Navigate to="/trainer-dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default TrainerApp
