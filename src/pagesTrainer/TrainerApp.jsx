import React from 'react'
import Navbar from './Component/Navbar/Navbar'
import Home from './Component/Home/Home'
import Active from './Component/Home/Batches'
import MyCourses from './Component/MyCourses/MyCourses'
import CourseView from './Component/MyCourses/CourseView'
import EditCourse from './Component/MyCourses/EditCourse'
import CreateCourse from './Component/MyCourses/CreateCourse/CreateCourse'
import MyBatchs from './Component/MyBatchs/MyBatchs'
import BatchDetails from './Component/MyBatchs/BatchDetails'
import Profile from './Component/Profile/Profile'
import EditProfile from './Component/Profile/EditProfile'
import initialProfileData from './Component/Profile/profileData.json'
import './TrainerGlobal.css'
import './TrainerApp.css'
import Footer from './Component/Navbar/Footer'
import { useTrainerBootstrap } from '../hooks/useTrainerBootstrap'
import Loader from '../components/common/Loader/Loader'

function TrainerApp() {
  const [activeTab, setActiveTab] = React.useState('home');
  const [selectedBatch, setSelectedBatch] = React.useState(null);
  const [isEditingCourse, setIsEditingCourse] = React.useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = React.useState(false);
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [profileData, setProfileData] = React.useState(initialProfileData);

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
            <CreateCourse
              onBack={() => setIsCreatingCourse(false)}
              onSave={() => {
                // Success callback from CreateCourse (after API success)
                setIsCreatingCourse(false);
                setSelectedBatch(null); // Return to list
              }}
            />
          ) : selectedBatch ? (
            isEditingCourse ? (
              <CreateCourse
                initialData={selectedBatch}
                isEditMode={true}
                onBack={() => setIsEditingCourse(false)}
                onSave={(updatedData) => {
                  // Success callback from EditCourse (after API success)
                  setIsEditingCourse(false);
                  setSelectedBatch(null); // Return to list to see updates
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
              onCreateNew={() => setIsCreatingCourse(true)}
            />
          )
        )}
        {activeTab === 'profile' && (
          isEditingProfile ? (
            <EditProfile
              profileData={profileData}
              onCancel={() => setIsEditingProfile(false)}
              onSave={(newData) => {
                setProfileData(newData);
                setIsEditingProfile(false);
              }}
              onBack={() => setActiveTab('home')}
            />
          ) : (
            <Profile
              profileData={profileData}
              onEdit={() => setIsEditingProfile(true)}
              onBack={() => setActiveTab('home')}
            />
          )
        )}
      </main>
      <Footer />
    </div>
  )
}

export default TrainerApp
