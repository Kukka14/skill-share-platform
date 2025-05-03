import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import SignUp from './SignUp';
import Profile from './Profile';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});

  // Function to handle user login
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('token', userData.token);
  };

  // Function to handle user logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  // Function to handle likes
  const handleLike = (postId) => {
    setLikes(prevLikes => ({
      ...prevLikes,
      [postId]: (prevLikes[postId] || 0) + 1
    }));
  };

  // Function to handle comments
  const handleComment = (postId, comment) => {
    setComments(prevComments => ({
      ...prevComments,
      [postId]: [...(prevComments[postId] || []), comment]
    }));
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route 
            path="/login" 
            element={<Login onLogin={handleLogin} />} 
          />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile 
                  user={user}
                  onLogout={handleLogout}
                  likes={likes}
                  comments={comments}
                  onLike={handleLike}
                  onComment={handleComment}
                />
              </ProtectedRoute>
            }
          />
          {/* Add more routes here as needed */}
        </Routes>
      </div>
    </Router>
  );
}

// Navigation Component
const Navigation = ({ user, onLogout }) => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-600">Skill Share</h1>
            </div>
          </div>
          {user && (
            <div className="flex items-center">
              <button
                onClick={onLogout}
                className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
