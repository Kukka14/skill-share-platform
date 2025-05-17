import React from 'react';
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

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />

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
            path="/learning-plan" 
            element={
              <ProtectedRoute>
                <LearningPlanPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
