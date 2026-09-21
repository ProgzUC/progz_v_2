import React from 'react'
import Navbar from './Component/Navbar/Navbar'
import Home from './Component/Home/Home'
import Active from './Component/Home/Batches'
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
import Loader from '../components/common/Loader/Loader'
import AnnouncementBanner from '../../components/common/AnnouncementBanner/AnnouncementBanner'

function TrainerApp() {
  const [activeTab, setActiveTab] = React.useState('home');
  const [selectedBatch, setSelectedBatch] = React.useState(null);
  const [isEditingCourse, setIsEditingCourse] = React.useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = React.useState(false);
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);

  const { data, isLoading, isError, error } = useTrainerBootstrap();

  if (isLoading) return <Loader />;
  if (isError) {
    console.error("BOOTSTRAP ERROR:", error);
    return <p>Failed to load</p>;
  }

  const handleViewDetails = (batch) => {
    setSelectedBatch(batch);
  };

  const handleViewBatchFromHome = (batch) => {
    setSelectedBatch(batch);
    setActiveTab('batches');
  };

  const handleBackToList = () => {
    setSelectedBatch(null);
    setIsEditingCourse(false);
    setIsCreatingCourse(false);
  };

  return (
    <div className="trainer-app">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedBatch(null);
          setIsEditingCourse(false);
          setIsCreatingCourse(false);
          setIsEditingProfile(false);
        }}
      />
      <AnnouncementBanner source="trainer" />
      <main className="main-content">
        {activeTab === 'home' && (
          <>
            <Home
              trainer={data.trainer}
              stats={data.stats}
              onNavigateToCreateCourse={() => {
                setActiveTab('courses');
                setIsCreatingCourse(true);
              }}
              onNavigateToMyCourses={() => setActiveTab('courses')}
            />
            <Active data={data} onViewBatch={handleViewBatchFromHome} />
          </>
        )}
        {activeTab === 'batches' && (
          <>
            {selectedBatch ? (
              <BatchDetails batch={selectedBatch} onBack={handleBackToList} />
            ) : (
              <MyBatchs onViewDetails={handleViewDetails} />
            )}
          </>
        )}
        {activeTab === 'courses' && (
          isCreatingCourse ? (
            <CourseBuilder
              onBack={() => setIsCreatingCourse(false)}
              onSave={() => {
                setIsCreatingCourse(false);
                setSelectedBatch(null);
              }}
            />
          ) : selectedBatch ? (
            isEditingCourse ? (
              <CourseBuilder
                initialData={selectedBatch}
                isEditMode={true}
                onBack={() => setIsEditingCourse(false)}
                onSave={() => {
                  setIsEditingCourse(false);
                  setSelectedBatch(null);
                }}
              />
            ) : (
              <CourseView
                courseData={selectedBatch}
                onBack={handleBackToList}
                onEdit={() => setIsEditingCourse(true)}
              />
            )
          ) : (
            <MyCourses
              onManageCourse={(course) => setSelectedBatch(course)}
              onEditCourse={(course) => {
                setSelectedBatch(course);
                setIsEditingCourse(true);
              }}
              onCreateNew={() => setIsCreatingCourse(true)}
            />
          )
        )}
        {activeTab === 'profile' && (
          isEditingProfile ? (
            <EditProfile onCancel={() => setIsEditingProfile(false)} />
          ) : (
            <Profile
              onEdit={() => setIsEditingProfile(true)}
              onBack={() => setActiveTab('home')}
            />
          )
        )}
      </main>
    </div>
  )
}

export default TrainerApp
