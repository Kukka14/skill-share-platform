import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [postsWithUserData, setPostsWithUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const BACKEND_URL = 'http://localhost:8080';
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // User profile states
  const [userData, setUserData] = useState({
    id: '',
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    bio: '',
    profileImageUrl: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // Status related states
  const [statuses, setStatuses] = useState([]);
  const [isViewingStatus, setIsViewingStatus] = useState(false);
  const [selectedStatusIndex, setSelectedStatusIndex] = useState(null);
  const [statusUpdateTime, setStatusUpdateTime] = useState(null);
  
  const [likedPosts, setLikedPosts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [comments, setComments] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showComments, setShowComments] = useState({});

  const [followStatus, setFollowStatus] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  

  const token = localStorage.getItem('token'); // ✅ Add this line

///added by nethmi -----
const [overduePlans, setOverduePlans] = useState([]);
const [showReminder, setShowReminder] = useState(false);



const fetchUserLearningPlans = async () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  if (!token || !userId) return;

  try {
    const response = await fetch(`${BACKEND_URL}/api/learning-plans/user/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      console.error('Response status:', response.status);
      throw new Error('Failed to fetch learning plans');
    }

    const plans = await response.json();
    console.log('Learning plans:', plans);

    if (plans.length > 0) {
      toast.info(
        <div>
          <div>You have a learning plan. Don’t forget to complete it!</div>
          <button
            style={{
              marginTop: '8px',
              padding: '4px 10px',
              background: 'blue',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/learning-plan')}
          >
            Check Deadlines 
          </button>
        </div>,
        { autoClose: false } // optional: keep the toast open until user closes it
      );
    }
  } catch (err) {
    console.error('Error fetching learning plans:', err);
  }
};


///added by nethmi above -----


  const getCurrentUserId = () => {
    if (user?.id) return user.id;
    if (user?._id) return user._id;
    const storedId = localStorage.getItem('userId');
    if (storedId) return storedId;
    console.error('Could not determine current user ID', user);
    return null;
  };
  

  useEffect(() => {
  const fetchUserProfile = async () => {
    if (!token) {
      setError('Unauthorized. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();
      setUserData(data); // 👈 This triggers the next effect
    } catch (err) {
      setError(err.message || 'Error fetching user');
      setLoading(false);
    }
  };

  fetchUserProfile();
}, [token]);

useEffect(() => {
  if (userData.id) localStorage.setItem('userId', userData.id);
}, [userData.id]);


  


  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchUserProfile();
    fetchPosts();
    fetchAllStatuses();
  }, [isAuthenticated, navigate]);


  ///added by nethmi -----

useEffect(() => {
  if (isAuthenticated) {
    fetchUserLearningPlans();
  }
}, [isAuthenticated]);


  useEffect(() => {
    if (posts.length > 0) {
      fetchUserDataForPosts();
    } else {
      setIsLoading(false);
    }
  }, [posts]);

  useEffect(() => {
    if (postsWithUserData.length > 0 && postsWithUserData[0].userData?.id) {
     // console.log('User ID:', postsWithUserData[0].userData.id);
      //localStorage.setItem('userId', postsWithUserData[0].userData.id);
    }
  }, [postsWithUserData]);
  
  useEffect(() => {
    if (postsWithUserData.length > 0 && user) {
      fetchLikeStatus();
    }
  }, [postsWithUserData, user]);
  
  useEffect(() => {
    console.log('Current user:', user);
  }, [user]);


  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setUserData(data);
      if (data.profileImageUrl) {
        setImagePreview(data.profileImageUrl);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError('Failed to load profile data');
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    const formData = new FormData();
    if (selectedImage) {
      formData.append('profileImage', selectedImage);
    }
    formData.append('firstName', userData.firstName);
    formData.append('lastName', userData.lastName);
    formData.append('bio', userData.bio);

    try {
      const response = await fetch(`${BACKEND_URL}/api/users/${userData.id}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedData = await response.json();
      setUserData(updatedData);
      setIsEditing(false);
      setSelectedImage(null);
    } catch (error) {
      console.error('Update error:', error);
      setError('Failed to update profile');
    }
  };

  useEffect(() => {
    if (postsWithUserData.length > 0 && getCurrentUserId()) {
      fetchFollowStatus();
    }
  }, [postsWithUserData]);


  const fetchPosts = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to view posts');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      console.log('Fetched posts:', data);
      
      const postList = Array.isArray(data) ? data : (data._embedded?.postList || []);
      setPosts(postList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts: ' + error.message);
      setIsLoading(false);
    }
  };

  const fetchUserDataForPosts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      console.log('Fetching user data for posts:', posts);
      const postsWithUsers = await Promise.all(
        posts.map(async (post) => {
          try {
            const response = await fetch(`${BACKEND_URL}/api/users/${post.userId}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (!response.ok) {
              throw new Error('Failed to fetch user data');
            }

            const userData = await response.json();
            console.log(`User data for post ${post.id}:`, userData);
            return { ...post, userData };
          } catch (error) {
            console.error(`Error fetching user data for post ${post.id}:`, error);
            return { ...post, userData: null };
          }
        })
      );

      console.log('All posts with user data:', postsWithUsers);
      setPostsWithUserData(postsWithUsers);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchLikeStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      console.error('No user ID available for fetching like status');
      return;
    }
    
    try {
      console.log('Fetching like status with user ID:', currentUserId);
      
      const newLikedPosts = {};
      const newLikeCounts = {};
      
      await Promise.all(postsWithUserData.map(async (post) => {
        try {
          const countResponse = await fetch(`${BACKEND_URL}/api/interactions/posts/${post.id}/likes/count`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (countResponse.ok) {
            const count = await countResponse.json();
            console.log(`Like count for post ${post.id}:`, count);
            newLikeCounts[post.id] = count;
          } else {
            console.error(`Error fetching like count for post ${post.id}:`, await countResponse.text());
          }
          
          const likesResponse = await fetch(`${BACKEND_URL}/api/interactions/posts/${post.id}/likes`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (likesResponse.ok) {
            const likes = await likesResponse.json();
            console.log(`Likes for post ${post.id}:`, likes);
            
            const userLiked = Array.isArray(likes) && likes.some(like => {
              return like.userId === currentUserId;
            });
            
            console.log(`User ${currentUserId} has liked post ${post.id}:`, userLiked);
            newLikedPosts[post.id] = userLiked;
          } else {
            console.error(`Error fetching likes for post ${post.id}:`, await likesResponse.text());
          }
        } catch (error) {
          console.error(`Error fetching like data for post ${post.id}:`, error);
        }
      }));
      
      console.log('Final liked posts map:', newLikedPosts);
      console.log('Final like counts map:', newLikeCounts);
      
      setLikedPosts(newLikedPosts);
      setLikeCounts(newLikeCounts);
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

  const fetchFollowStatus = async () => {
    const token = localStorage.getItem('token');
    const currentUserId = getCurrentUserId();
    if (!token || !currentUserId) return;
    
    try {
      const newFollowStatus = {};
      
      await Promise.all(postsWithUserData.map(async (post) => {
        if (post.userId === currentUserId) return;
        
        try {
          const response = await fetch(`${BACKEND_URL}/api/follows/status?followerId=${currentUserId}&followedId=${post.userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const isFollowing = await response.json();
            newFollowStatus[post.userId] = isFollowing;
          }
        } catch (error) {
          console.error(`Error fetching follow status for user ${post.userId}:`, error);
        }
      }));
      
      setFollowStatus(newFollowStatus);
    } catch (error) {
      console.error('Error fetching follow status:', error);
    }
  };

  const handleFollowToggle = async (userId, isCurrentlyFollowing) => {
    const token = localStorage.getItem('token');
    const currentUserId = getCurrentUserId();
    
    if (!token || !currentUserId) {
      alert('You must be logged in to follow users');
      return;
    }
    
    try {
      setFollowStatus(prev => ({ ...prev, [userId]: !isCurrentlyFollowing }));
      
      const method = isCurrentlyFollowing ? 'DELETE' : 'POST';
      const url = `${BACKEND_URL}/api/follows?followerId=${currentUserId}&followedId=${userId}`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error ${isCurrentlyFollowing ? 'unfollowing' : 'following'} user:`, errorText);
        setFollowStatus(prev => ({ ...prev, [userId]: isCurrentlyFollowing }));
        alert(`Failed to ${isCurrentlyFollowing ? 'unfollow' : 'follow'} user: ${errorText || 'Unknown error'}`);
      } else {
        console.log(`Successfully ${isCurrentlyFollowing ? 'unfollowed' : 'followed'} user ${userId}`);
        window.dispatchEvent(new CustomEvent('follow-status-changed'));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      setFollowStatus(prev => ({ ...prev, [userId]: isCurrentlyFollowing }));
      alert(`Error ${isCurrentlyFollowing ? 'unfollowing' : 'following'} user: ${error.message}`);
    }
  };
  
  const handleLike = async (postId) => {
    const token = localStorage.getItem('token');
    const currentUserId = getCurrentUserId();
    
    if (!token || !currentUserId) {
      console.log('Cannot like: no token or userId available');
      alert('You must be logged in to like posts');
      return;
    }
    
    try {
      console.log(`Attempting to ${likedPosts[postId] ? 'unlike' : 'like'} post ${postId} for user ${currentUserId}`);
      
      const wasLiked = likedPosts[postId];
      if (wasLiked) {
        setLikedPosts(prev => ({ ...prev, [postId]: false }));
        setLikeCounts(prev => ({ ...prev, [postId]: Math.max(0, (prev[postId] || 1) - 1) }));
      } else {
        setLikedPosts(prev => ({ ...prev, [postId]: true }));
        setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
      }
      
      const response = await fetch(`${BACKEND_URL}/api/interactions/posts/${postId}/like?userId=${currentUserId}`, {
        method: wasLiked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const responseText = await response.text();
      console.log(`Response from ${wasLiked ? 'unlike' : 'like'}:`, responseText);
      
      if (!response.ok) {
        if (responseText.includes("already liked")) {
          console.log("Post was already liked, updating UI accordingly");
          setLikedPosts(prev => ({ ...prev, [postId]: true }));
          fetchLikeStatus();
          return;
        }
        
        console.error(`Error ${wasLiked ? 'unliking' : 'liking'} post:`, responseText);
        alert(`Failed to ${wasLiked ? 'unlike' : 'like'} post: ${responseText || 'Unknown error'}`);
        
        setLikedPosts(prev => ({ ...prev, [postId]: wasLiked }));
        setLikeCounts(prev => ({ 
          ...prev, 
          [postId]: wasLiked ? (prev[postId] || 0) + 1 : Math.max(0, (prev[postId] || 1) - 1) 
        }));
      } else {
        console.log(`Successfully ${wasLiked ? 'unliked' : 'liked'} post`);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert(`Error toggling like: ${error.message}`);
    }
  };
  
  const fetchComments = async (postId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      console.log(`Fetching comments for post ${postId} with auth token:`, token ? `${token.substring(0, 15)}...` : 'No token');
      
      const response = await fetch(`${BACKEND_URL}/api/interactions/posts/${postId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const fetchedComments = await response.json();
        console.log(`Fetched comments for post ${postId}:`, fetchedComments);
        setComments(prev => ({
          ...prev,
          [postId]: fetchedComments
        }));
      } else {
        const errorData = await response.text();
        console.error(`Error fetching comments for post ${postId}:`, errorData);
      }
      
      const countResponse = await fetch(`${BACKEND_URL}/api/interactions/posts/${postId}/comments/count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (countResponse.ok) {
        const count = await countResponse.json();
        setCommentCounts(prev => ({
          ...prev,
          [postId]: count
        }));
      } else {
        const errorData = await countResponse.text();
        console.error(`Error fetching comment count for post ${postId}:`, errorData);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };
  
  const handleComment = async (postId) => {
    if (!showComments[postId]) {
      setShowComments(prev => ({ ...prev, [postId]: true }));
      fetchComments(postId);
    } else {
      setShowComments(prev => ({ ...prev, [postId]: false }));
    }
  };
  
  const submitComment = async (postId) => {
    const token = localStorage.getItem('token');
    const currentUserId = getCurrentUserId();
    
    if (!token || !currentUserId || !newComment[postId]) {
      console.log('Cannot submit comment: missing token, userId, or comment text');
      return;
    }
    
    try {
      console.log(`Submitting comment to post ${postId} with userId ${currentUserId}: "${newComment[postId]}"`);
      
      const response = await fetch(`${BACKEND_URL}/api/interactions/posts/${postId}/comments?userId=${currentUserId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newComment[postId])
      });
      
      const responseText = await response.text();
      console.log('Response from submit comment:', responseText);
      
      if (response.ok) {
        let addedComment;
        try {
          addedComment = JSON.parse(responseText);
        } catch (e) {
          console.error('Error parsing comment response:', e);
          addedComment = { id: Date.now(), content: newComment[postId], user: user };
        }
        
        console.log('Added comment:', addedComment);
        
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), addedComment]
        }));
        
        setCommentCounts(prev => ({
          ...prev,
          [postId]: (prev[postId] || 0) + 1
        }));
        
        setNewComment(prev => ({ ...prev, [postId]: '' }));
      } else {
        console.error('Error response:', response.status, responseText);
        alert(`Failed to add comment: ${responseText || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert(`Error adding comment: ${error.message}`);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditCommentText(comment.content);
  };

  const cancelEditComment = () => {
    setEditingComment(null);
    setEditCommentText('');
  };

  const saveEditComment = async (postId, commentId) => {
    const token = localStorage.getItem('token');
    if (!token || !editCommentText.trim()) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/interactions/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editCommentText)
      });
      
      if (response.ok) {
        const updatedComment = await response.json();
        
        setComments(prev => ({
          ...prev,
          [postId]: prev[postId].map(comment => 
            comment.id === commentId ? updatedComment : comment
          )
        }));
        
        setEditingComment(null);
        setEditCommentText('');
      } else {
        const errorText = await response.text();
        console.error('Error updating comment:', errorText);
        alert(`Failed to update comment: ${errorText || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert(`Error updating comment: ${error.message}`);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/interactions/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setComments(prev => ({
          ...prev,
          [postId]: prev[postId].filter(comment => comment.id !== commentId)
        }));
        
        setCommentCounts(prev => ({
          ...prev,
          [postId]: Math.max(0, (prev[postId] || 1) - 1)
        }));
      } else {
        const errorText = await response.text();
        console.error('Error deleting comment:', errorText);
        alert(`Failed to delete comment: ${errorText || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert(`Error deleting comment: ${error.message}`);
    }
  };

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
  };

  const fetchAllStatuses = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/status/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch statuses');

      const data = await response.json();
      setStatuses(data);
    } catch (error) {
      console.error('Status fetch error:', error);
    }
  };

  const handleStatusClick = (index) => {
    setSelectedStatusIndex(index);
    setIsViewingStatus(true);
  };

  const handleNextStatus = () => {
    if (selectedStatusIndex < statuses.length - 1) {
      setSelectedStatusIndex(selectedStatusIndex + 1);
    } else {
      setIsViewingStatus(false);
    }
  };

  const handlePrevStatus = () => {
    if (selectedStatusIndex > 0) {
      setSelectedStatusIndex(selectedStatusIndex - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* User Profile Section */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
            <div className="relative h-56 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">
              {/* Decorative Elements */}
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-32 -translate-y-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full transform -translate-x-32 translate-y-32"></div>
              
              {/* Cover Image */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end space-x-6">
                  <div className="relative group">
                    <div 
                      className="h-36 w-36 rounded-full border-4 border-white overflow-hidden bg-white cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      onClick={() => navigate('/profile')}
                    >
                      {imagePreview ? (
                        <img
                          src={getFullImageUrl(imagePreview)}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-5xl text-gray-500">
                          {userData?.firstName?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent group-hover:border-blue-400 transition-all duration-300"></div>
                  </div>
                  <div className="flex-grow pb-2">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Welcome,{' '}
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                        {userData ? `${userData.firstName} ${userData.lastName}` : 'Loading...'}
                      </span>
                    </h1>
                    <div className="flex items-center space-x-4">
                      <p className="text-white text-opacity-90 text-lg">
                        {userData?.bio || 'No bio yet'}
                      </p>
                      <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                    </div>
                    <div className="mt-3 flex items-center space-x-4 text-white text-opacity-80">
                      <div className="flex items-center space-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>@{userData?.username || 'user'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{userData?.email || 'email@example.com'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Statuses</h2>
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {statuses.map((status, index) => (
                <div
                  key={status.id}
                  onClick={() => handleStatusClick(index)}
                  className="flex-shrink-0 cursor-pointer"
                >
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-blue-500">
                      {status.imageUrl && (
                        <img
                          src={getFullImageUrl(status.imageUrl)}
                          alt="Status"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <p className="mt-2 text-center text-sm text-gray-600 truncate w-20">
                    {status.text || 'No text'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Status View Modal */}
          {isViewingStatus && selectedStatusIndex !== null && (
            <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
              <div className="relative w-full h-full">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setIsViewingStatus(false)}
                    className="text-white bg-black bg-opacity-50 rounded-full p-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {selectedStatusIndex > 0 && (
                  <button
                    onClick={handlePrevStatus}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                
                <div className="h-full flex items-center justify-center">
                  <div className="max-w-2xl w-full">
                    {statuses[selectedStatusIndex].imageUrl && (
                      <img
                        src={getFullImageUrl(statuses[selectedStatusIndex].imageUrl)}
                        alt="Status"
                        className="w-full h-[80vh] object-contain"
                      />
                    )}
                    {statuses[selectedStatusIndex].text && (
                      <div className="absolute bottom-20 left-0 right-0 p-4 bg-black bg-opacity-50 text-white">
                        <p className="text-center">{statuses[selectedStatusIndex].text}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedStatusIndex < statuses.length - 1 && (
                  <button
                    onClick={handleNextStatus}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {postsWithUserData.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                    {post.userData?.profileImageUrl ? (
                      <img
                        src={getFullImageUrl(post.userData.profileImageUrl)}
                        alt={`${post.userData.firstName}'s profile`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xl text-gray-500">
                        {post.userData?.firstName?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="text-xs text-gray-400">User ID: {post.userId}</p>
                    <p className="font-medium text-gray-900">
                      {post.userData ? `${post.userData.firstName} ${post.userData.lastName}` : 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {post.userId !== getCurrentUserId() && (
                    <button 
                      className={`px-3 py-1 ${
                        followStatus[post.userId] 
                          ? 'bg-gray-300 hover:bg-gray-400 text-gray-800' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      } text-sm font-medium rounded-md transition-colors`}
                      onClick={() => handleFollowToggle(post.userId, followStatus[post.userId])}
                    >
                      {followStatus[post.userId] ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>

                <p className="text-gray-700">{post.description}</p>
                
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div className={`mt-4 grid gap-2 ${
                    post.mediaUrls.length === 1 ? 'grid-cols-1' :
                    post.mediaUrls.length === 2 ? 'grid-cols-2' :
                    'grid-cols-2'
                  }`}>
                    {post.mediaUrls.map((url, index) => (
                      <div key={index} className={`relative ${
                        post.mediaUrls.length === 3 && index === 0 ? 'col-span-2' : ''
                      }`}>
                        {post.mediaTypes?.[index]?.startsWith('video/') ? (
                          <video
                            src={getFullImageUrl(url)}
                            className={`w-full ${
                              post.mediaUrls.length === 1 ? 'h-96' :
                              post.mediaUrls.length === 2 ? 'h-64' :
                              post.mediaUrls.length === 3 && index === 0 ? 'h-64' :
                              'h-64'
                            } object-cover rounded-lg`}
                            controls
                          />
                        ) : (
                          <img
                            src={getFullImageUrl(url)}
                            alt={`Post media ${index + 1}`}
                            className={`w-full ${
                              post.mediaUrls.length === 1 ? 'h-96' :
                              post.mediaUrls.length === 2 ? 'h-64' :
                              post.mediaUrls.length === 3 && index === 0 ? 'h-64' :
                              'h-64'
                            } object-cover rounded-lg`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div className="flex items-center space-x-4">
                    <button 
                      className={`flex items-center ${likedPosts[post.id] ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                      onClick={() => handleLike(post.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" 
                        fill={likedPosts[post.id] ? "currentColor" : "none"} 
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>Like{likeCounts[post.id] > 0 ? ` (${likeCounts[post.id]})` : ''}</span>
                    </button>
                    <button 
                      className="flex items-center text-gray-500 hover:text-blue-600"
                      onClick={() => handleComment(post.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Comment {commentCounts[post.id] > 0 && `(${commentCounts[post.id]})`}
                    </button>
                    <button className="flex items-center text-gray-500 hover:text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                  </div>
                </div>
                
                {showComments[post.id] && (
                  <div className="mt-4 border-t pt-4">
                    <h3 className="font-medium mb-2">Comments</h3>
                    <div className="space-y-3">
                      {comments[post.id]?.length > 0 ? (
                        comments[post.id].map((comment) => (
                          <div key={comment.id} className="flex space-x-2">
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                              {comment.user?.profileImageUrl ? (
                                <img
                                  src={getFullImageUrl(comment.user.profileImageUrl)}
                                  alt={`${comment.user.firstName}'s profile`}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                  {comment.user?.firstName?.charAt(0) || '?'}
                                </div>
                              )}
                            </div>
                            <div className="bg-gray-100 rounded-lg p-2 flex-grow">
                              <div className="flex justify-between items-start">
                                <p className="text-xs font-medium">
                                  {comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Unknown User'}
                                </p>
                                {comment.user?.id === getCurrentUserId() && (
                                  <div className="flex space-x-2">
                                    <button 
                                      onClick={() => handleEditComment(comment)}
                                      className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      Edit
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteComment(post.id, comment.id)}
                                      className="text-xs text-red-600 hover:text-red-800"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              {editingComment === comment.id ? (
                                <div className="mt-1">
                                  <textarea
                                    value={editCommentText}
                                    onChange={(e) => setEditCommentText(e.target.value)}
                                    className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    rows="2"
                                  />
                                  <div className="flex justify-end space-x-2 mt-1">
                                    <button
                                      onClick={cancelEditComment}
                                      className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => saveEditComment(post.id, comment.id)}
                                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm">{comment.content}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(comment.createdAt).toLocaleString()}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
                      )}
                      
                      <div className="flex space-x-2 mt-3">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          {user?.profileImageUrl ? (
                            <img
                              src={getFullImageUrl(user.profileImageUrl)}
                              alt="Your profile"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-gray-500">
                              {user?.firstName?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div className="flex-grow flex">
                          <input
                            type="text"
                            className="border rounded-l-lg px-3 py-1 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Write a comment..."
                            value={newComment[post.id] || ''}
                            onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newComment[post.id]) {
                                submitComment(post.id);
                              }
                            }}
                          />
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded-r-lg hover:bg-blue-600 disabled:bg-gray-300"
                            onClick={() => submitComment(post.id)}
                            disabled={!newComment[post.id]}
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {postsWithUserData.length === 0 && !error && (
            <div className="bg-white rounded-lg p-6 text-center text-gray-500">
              No posts available. Follow some users to see their posts here!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}