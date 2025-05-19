import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import Login from './Login';
import SignUp from './SignUp';
import Home from './Home';
import Profile from './Profile';
import NotificationsDashboard from './NotificationsDashboard';
import LearningPlanPage from './pages/LearningPlanPage';
import PostViewPage from './PostViewPage';
import StatusViewPage from './StatusViewPage';
import FollowersProfile from './FollowersProfile';


// ✅ Import ToastContainer from react-toastify
import { ToastContainer } from 'react-toastify';
// ✅ Import react-toastify CSS once globally
import 'react-toastify/dist/ReactToastify.css';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/home" />} />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <NotificationsDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
          path="/posts/:postId" 
          element={
            <ProtectedRoute>
              <PostViewPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/status/:statusId" 
          element={
            <ProtectedRoute>
              <StatusViewPage />
            </ProtectedRoute>
          } 
        />

          {/* <Route path="/posts/:postId" element={<PostViewPage />} /> */}

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/:userId" 
            element={
              <ProtectedRoute>
                <FollowersProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learning-plan" 
            element={
              <ProtectedRoute>
                <LearningPlanPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
         {/* ✅ Add ToastContainer near root to show toast notifications globally */}
      <ToastContainer 
        position="top-right" 
        autoClose={30000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        
  progressClassName="!bg-blue-600 !shadow-blue-300"
  // progressStyle={{
  //   backgroundColor: '#2563eb',         // progress bar blue-600
  //   boxShadow: '0 0 10pxrgb(182, 201, 223)',      // light blue glow shadow
  // }}
        
  
  
      />

    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
