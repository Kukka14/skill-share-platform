import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VoiceInput from './components/VoiceInput';

export default function Profile() {
  const [userData, setUserData] = useState({
    id: '',
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    bio: '',
    profileImageUrl: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatusText, setNewStatusText] = useState('');
  const [newStatusImage, setNewStatusImage] = useState(null);
  const [statusImagePreview, setStatusImagePreview] = useState('');
  const [selectedStatusIndex, setSelectedStatusIndex] = useState(null);
  const [isViewingStatus, setIsViewingStatus] = useState(false);
  const [statusUpdateTime, setStatusUpdateTime] = useState(null);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [editingStatusText, setEditingStatusText] = useState('');
  const [editingStatusImage, setEditingStatusImage] = useState(null);
  const [editingStatusImagePreview, setEditingStatusImagePreview] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editPostDescription, setEditPostDescription] = useState('');
  const [editPostMedia, setEditPostMedia] = useState([]);
  const [editPostMediaPreviews, setEditPostMediaPreviews] = useState([]);
  const [newPostDescription, setNewPostDescription] = useState('');
  const [newPostMedia, setNewPostMedia] = useState([]);
  const [newPostMediaPreviews, setNewPostMediaPreviews] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [comments, setComments] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showComments, setShowComments] = useState({});
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const navigate = useNavigate();
  const BACKEND_URL = 'http://localhost:8080';

  useEffect(() => {
    fetchUserProfile();
    fetchUserStatuses();
  }, []);

  useEffect(() => {
    if (userData.id) {
      fetchUserPosts();
      fetchFollowingCount();
      fetchFollowersCount();
    }
  }, [userData.id]);

  useEffect(() => {
    if (posts.length > 0 && userData.id) {
      fetchLikeStatus();
    }
  }, [posts, userData.id]);

  useEffect(() => {
    const handleFollowStatusChange = () => {
      fetchFollowingCount();
      fetchFollowersCount();
    };
    
    window.addEventListener('follow-status-changed', handleFollowStatusChange);
    return () => {
      window.removeEventListener('follow-status-changed', handleFollowStatusChange);
    };
  }, [userData.id]);

  console.log('User ID:', userData.id);
  localStorage.setItem('userId', userData.id);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      console.log('Fetching user profile...');
      const response = await fetch('http://localhost:8080/api/users/me', {
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
      console.log('Fetched user profile data:', data);
      setUserData(data);
      if (data.profileImageUrl) {
        setImagePreview(data.profileImageUrl);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStatuses = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8080/api/status/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch statuses');
      }

      const data = await response.json();
      setStatuses(data);
    } catch (error) {
      console.error('Status fetch error:', error);
    }
  };

  const fetchUserPosts = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      return;
    }

    if (!userData.id) {
      console.log('No user ID available');
      return;
    }

    try {
      console.log('Fetching posts for user:', userData.id);
      const response = await fetch(`http://localhost:8080/api/posts/user/${userData.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response not OK:', response.status, errorText);
        throw new Error(`Failed to fetch posts: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Received posts data:', data);
      
      const sortedPosts = (data._embedded?.postList || []).sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      console.log('Sorted posts:', sortedPosts);
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Posts fetch error:', error);
      setError('Failed to load posts: ' + error.message);
    }
  };

  const fetchLikeStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token || !userData.id) return;
    
    try {
      console.log('Fetching like status for user posts');
      
      const newLikedPosts = {};
      const newLikeCounts = {};
      
      await Promise.all(posts.map(async (post) => {
        try {
          const countResponse = await fetch(`${BACKEND_URL}/api/interactions/posts/${post.id}/likes/count`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (countResponse.ok) {
            const count = await countResponse.json();
            newLikeCounts[post.id] = count;
          }
          
          const likesResponse = await fetch(`${BACKEND_URL}/api/interactions/posts/${post.id}/likes`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (likesResponse.ok) {
            const likes = await likesResponse.json();
            const userLiked = Array.isArray(likes) && likes.some(like => like.userId === userData.id);
            newLikedPosts[post.id] = userLiked;
          }
        } catch (error) {
          console.error(`Error fetching like data for post ${post.id}:`, error);
        }
      }));
      
      setLikedPosts(newLikedPosts);
      setLikeCounts(newLikeCounts);
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

  const fetchComments = async (postId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      console.log(`Fetching comments for post ${postId}`);
      
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
        console.error(`Error fetching comments for post ${postId}:`, await response.text());
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
        console.error(`Error fetching comment count for post ${postId}:`, await countResponse.text());
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchFollowingCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/follows/count?userId=${userData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const count = await response.json();
        setFollowingCount(count);
      } else {
        console.error('Failed to fetch following count:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching following count:', error);
    }
  };

  const fetchFollowersCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/follows/followers/count?userId=${userData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const count = await response.json();
        setFollowersCount(count);
      } else {
        console.error('Failed to fetch followers count:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching followers count:', error);
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
    if (!token || !userData.id || !newComment[postId]) {
      console.log('Cannot submit comment: missing token, userId, or comment text');
      return;
    }
    
    try {
      console.log(`Submitting comment to post ${postId} with userId ${userData.id}: "${newComment[postId]}"`);
      
      const response = await fetch(`${BACKEND_URL}/api/interactions/posts/${postId}/comments?userId=${userData.id}`, {
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
          addedComment = { id: Date.now(), content: newComment[postId], user: userData };
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

  const handleLike = async (postId) => {
    const token = localStorage.getItem('token');
    if (!token || !userData.id) {
      console.log('Cannot like: no token or userId available');
      return;
    }
    
    try {
      const wasLiked = likedPosts[postId];
      setLikedPosts(prev => ({ ...prev, [postId]: !wasLiked }));
      setLikeCounts(prev => ({ 
        ...prev, 
        [postId]: wasLiked ? 
          Math.max(0, (prev[postId] || 1) - 1) : 
          ((prev[postId] || 0) + 1) 
      }));
      
      const response = await fetch(`${BACKEND_URL}/api/interactions/posts/${postId}/like?userId=${userData.id}`, {
        method: wasLiked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error('Error toggling like:', await response.text());
        setLikedPosts(prev => ({ ...prev, [postId]: wasLiked }));
        setLikeCounts(prev => ({ 
          ...prev, 
          [postId]: wasLiked ? 
            (prev[postId] || 0) + 1 : 
            Math.max(0, (prev[postId] || 1) - 1)
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
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

  const handleStatusImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewStatusImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setStatusImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const formData = new FormData();
    if (selectedImage) {
      formData.append('profileImage', selectedImage);
    }
    formData.append('firstName', userData.firstName);
    formData.append('lastName', userData.lastName);
    formData.append('bio', userData.bio);

    try {
      const response = await fetch(`http://localhost:8080/api/users/${userData.id}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedData = await response.json();
      setUserData(updatedData);
      if (updatedData.profileImageUrl) {
        setImagePreview(updatedData.profileImageUrl);
      }
      setIsEditing(false);
      setSelectedImage(null);
    } catch (error) {
      setError('Failed to update profile');
      console.error('Update error:', error);
    }
  };

  const handleCreateStatus = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    const formData = new FormData();
    if (newStatusImage) {
      formData.append('image', newStatusImage);
    }
    if (newStatusText) {
      formData.append('text', newStatusText);
    }

    try {
      const response = await fetch('http://localhost:8080/api/status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to create status');
      }

      const newStatus = await response.json();
      setStatuses([newStatus, ...statuses]);
      setIsStatusModalOpen(false);
      setNewStatusText('');
      setNewStatusImage(null);
      setStatusImagePreview('');
    } catch (error) {
      setError('Failed to create status');
      console.error('Status creation error:', error);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    const formData = new FormData();
    if (editingStatusImage) {
      formData.append('image', editingStatusImage);
    }
    if (editingStatusText) {
      formData.append('text', editingStatusText);
    }

    try {
      const response = await fetch(`http://localhost:8080/api/status/${editingStatusId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const updatedStatus = await response.json();
      setStatuses(statuses.map(status => 
        status.id === editingStatusId ? updatedStatus : status
      ));
      setIsEditingStatus(false);
      setEditingStatusId(null);
      setEditingStatusText('');
      setEditingStatusImage(null);
      setEditingStatusImagePreview('');
      setStatusUpdateTime(new Date());
    } catch (error) {
      setError('Failed to update status');
      console.error('Status update error:', error);
    }
  };

  const handleEditStatus = (status) => {
    setEditingStatusId(status.id);
    setEditingStatusText(status.text || '');
    setEditingStatusImagePreview(status.imageUrl || '');
    setIsEditingStatus(true);
  };

  const handleDeleteStatus = async (statusId) => {
    if (!window.confirm('Are you sure you want to delete this status?')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8080/api/status/${statusId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete status');
      }

      setStatuses(statuses.filter(status => status.id !== statusId));
      setStatusUpdateTime(new Date());
    } catch (error) {
      setError('Failed to delete status');
      console.error('Status deletion error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
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

  const handleKeyDown = (e) => {
    if (isViewingStatus) {
      if (e.key === 'ArrowRight') {
        handleNextStatus();
      } else if (e.key === 'ArrowLeft') {
        handlePrevStatus();
      } else if (e.key === 'Escape') {
        setIsViewingStatus(false);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isViewingStatus, selectedStatusIndex]);

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
  };

  const handlePostMediaChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      if (files.length > 3) {
        setError('Maximum 3 media files allowed per post');
        return;
      }

      setNewPostMedia(files);
      
      const previews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push({
            url: reader.result,
            type: file.type
          });
          if (previews.length === files.length) {
            setNewPostMediaPreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    const formData = new FormData();
    formData.append('userId', userData.id);
    formData.append('description', newPostDescription);
    newPostMedia.forEach(file => {
      formData.append('mediaFiles', file);
    });

    try {
      const response = await fetch('http://localhost:8080/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const newPost = await response.json();
      setPosts([newPost, ...posts]);
      setIsPostModalOpen(false);
      setNewPostDescription('');
      setNewPostMedia([]);
      setNewPostMediaPreviews([]);
    } catch (error) {
      setError('Failed to create post: ' + error.message);
      console.error('Post creation error:', error);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditPostDescription(post.description);
    setEditPostMedia([]);
    setEditPostMediaPreviews(post.mediaUrls.map(url => getFullImageUrl(url)));
    setIsEditPostModalOpen(true);
  };

  const handleEditPostMediaChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      if (files.length > 3) {
        setError('Maximum 3 media files allowed per post');
        return;
      }

      setEditPostMedia(files);
      
      const previews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push({
            url: reader.result,
            type: file.type
          });
          if (previews.length === files.length) {
            setEditPostMediaPreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token || !editingPost) return;

    const formData = new FormData();
    formData.append('description', editPostDescription);
    editPostMedia.forEach(file => {
      formData.append('mediaFiles', file);
    });

    try {
      const response = await fetch(`http://localhost:8080/api/posts/${editingPost.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      const updatedPost = await response.json();
      setPosts(posts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      
      setIsEditPostModalOpen(false);
      setEditingPost(null);
      setEditPostDescription('');
      setEditPostMedia([]);
      setEditPostMediaPreviews([]);
    } catch (error) {
      setError('Failed to update post: ' + error.message);
      console.error('Post update error:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      return;
    }

    try {
      console.log('Attempting to delete post:', postId);
      const response = await fetch(`http://localhost:8080/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Delete response status:', response.status);
      
      if (response.ok || response.status === 204 || response.status === 500) {
        console.log('Post deletion attempted, checking if post was removed');
        setPosts(posts.filter(post => post.id !== postId));
        fetchUserPosts();
        setError('Post deleted successfully');
        setTimeout(() => setError(''), 3000);
      } else {
        let errorMessage = 'Failed to delete post';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('Delete error response:', errorData);
        } catch (e) {
          console.error('Could not parse error response:', e);
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Post deletion error details:', {
        error: error.message,
        postId: postId,
        posts: posts
      });
      
      if (posts.some(post => post.id === postId)) {
        setError(`Failed to delete post: ${error.message}`);
      }
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
        <div className="rounded-lg bg-white shadow-lg">
          <div className="px-4 py-5 sm:p-6">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}
            
            {/* Status Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold text-gray-900">My Status</h2>
                  <div className="flex items-center space-x-3">
                    <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                      <span className="font-medium">{followingCount}</span> Following
                    </div>
                    <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                      <span className="font-medium">{followersCount}</span> Followers
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {statusUpdateTime && (
                    <span className="text-sm text-gray-500">
                      Last updated: {new Date(statusUpdateTime).toLocaleTimeString()}
                    </span>
                  )}
                  <button
                    onClick={() => setIsStatusModalOpen(true)}
                    className="rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              
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
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                      onClick={() => handleEditStatus(statuses[selectedStatusIndex])}
                      className="text-white bg-black bg-opacity-50 rounded-full p-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteStatus(statuses[selectedStatusIndex].id)}
                      className="text-white bg-black bg-opacity-50 rounded-full p-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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

            {/* Status Creation Modal */}
            {isStatusModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Create New Status</h3>
                  <form onSubmit={handleCreateStatus}>
                    <div className="mb-4">
                      <textarea
                        value={newStatusText}
                        onChange={(e) => setNewStatusText(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                        rows="3"
                      />
                    </div>
                    <div className="mb-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleStatusImageChange}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                    </div>
                    {statusImagePreview && (
                      <div className="mb-4">
                        <img
                          src={statusImagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsStatusModalOpen(false);
                          setNewStatusText('');
                          setNewStatusImage(null);
                          setStatusImagePreview('');
                        }}
                        className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Post Status
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Status Edit Modal */}
            {isEditingStatus && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Edit Status</h3>
                  <form onSubmit={handleUpdateStatus}>
                    <div className="mb-4">
                      <textarea
                        value={editingStatusText}
                        onChange={(e) => setEditingStatusText(e.target.value)}
                        placeholder="Update your status text"
                        className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                        rows="3"
                      />
                    </div>
                    <div className="mb-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setEditingStatusImage(file);
                            
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditingStatusImagePreview(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                    </div>
                    {editingStatusImagePreview && (
                      <div className="mb-4">
                        <img
                          src={getFullImageUrl(editingStatusImagePreview)}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingStatus(false);
                          setEditingStatusId(null);
                          setEditingStatusText('');
                          setEditingStatusImage(null);
                          setEditingStatusImagePreview('');
                        }}
                        className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Update Status
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            <div className="mb-8 text-center">
              <div className="mx-auto h-32 w-32 overflow-hidden rounded-full bg-gray-200">
                {imagePreview ? (
                  <img
                    src={getFullImageUrl(imagePreview)}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl text-gray-500">
                    {userData.firstName.charAt(0)}
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="mt-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      value={userData.firstName}
                      onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      value={userData.lastName}
                      onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      value={userData.bio}
                      onChange={(e) => setUserData({...userData, bio: e.target.value})}
                      rows="3"
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setImagePreview(userData.profileImageUrl);
                    }}
                    className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <div className="mt-1 rounded-md border border-gray-300 bg-gray-50 p-2">
                      {userData.username}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="mt-1 rounded-md border border-gray-300 bg-gray-50 p-2">
                      {userData.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <div className="mt-1 rounded-md border border-gray-300 bg-gray-50 p-2">
                      {userData.firstName}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <div className="mt-1 rounded-md border border-gray-300 bg-gray-50 p-2">
                      {userData.lastName}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <div className="mt-1 rounded-md border border-gray-300 bg-gray-50 p-2">
                      {userData.bio || 'No bio available'}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Posts Section */}
        <div className="mt-8 rounded-lg bg-white shadow-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Posts</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsPostModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Post
                </button>
              </div>
            </div>
            <div className="space-y-6 max-h-[600px] overflow-y-auto">
              {posts.map((post) => (
                <div key={post.id} className="border rounded-lg overflow-hidden bg-white">
                  <div className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                        {userData.profileImageUrl ? (
                          <img
                            src={getFullImageUrl(userData.profileImageUrl)}
                            alt={`${userData.firstName}'s profile`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xl text-gray-500">
                            {userData.firstName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{userData.firstName} {userData.lastName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-gray-700">{post.description}</p>
                  </div>
                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className={`grid gap-1 ${
                      post.mediaUrls.length === 1 ? 'grid-cols-1' :
                      post.mediaUrls.length === 2 ? 'grid-cols-2' :
                      post.mediaUrls.length === 3 ? 'grid-cols-2' :
                      'grid-cols-2'
                    }`}>
                      {post.mediaUrls.map((url, index) => (
                        <div key={index} className={`relative ${
                          post.mediaUrls.length === 3 && index === 0 ? 'col-span-2' : ''
                        }`}>
                          {post.mediaTypes && post.mediaTypes[index]?.startsWith('video/') ? (
                            <video
                              src={getFullImageUrl(url)}
                              className={`w-full ${
                                post.mediaUrls.length === 1 ? 'h-96' :
                                post.mediaUrls.length === 2 ? 'h-64' :
                                post.mediaUrls.length === 3 && index === 0 ? 'h-64' :
                                'h-64'
                              } object-cover`}
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
                              } object-cover`}
                            />
                          )}
                          {post.mediaUrls.length > 3 && index === 2 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <span className="text-white text-2xl font-bold">
                                +{post.mediaUrls.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="p-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center ${likedPosts[post.id] === true ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" 
                            fill={likedPosts[post.id] === true ? "currentColor" : "none"} 
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span>Like{likeCounts[post.id] > 0 ? ` (${likeCounts[post.id]})` : ''}</span>
                        </button>
                        <button 
                          onClick={() => handleComment(post.id)}
                          className="flex items-center text-gray-500 hover:text-blue-600"
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
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditPost(post)}
                          className="text-gray-500 hover:text-blue-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Add comment section */}
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
                                    {comment.user?.id === userData.id && (
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
                              {userData?.profileImageUrl ? (
                                <img
                                  src={getFullImageUrl(userData.profileImageUrl)}
                                  alt="Your profile"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                  {userData?.firstName?.charAt(0) || '?'}
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
                              <VoiceInput 
                                onTranscriptionComplete={(text) => {
                                  setNewComment(prev => ({ ...prev, [post.id]: text }));
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
              {posts.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No posts yet. Create your first post to share with others!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Post Modal */}
        {isPostModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New Post</h3>
              <form onSubmit={handleCreatePost}>
                <div className="mb-4">
                  <textarea
                    value={newPostDescription}
                    onChange={(e) => setNewPostDescription(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                    rows="3"
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handlePostMediaChange}
                    multiple
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-sm text-gray-500">You can select up to 3 files</p>
                </div>
                {newPostMediaPreviews.length > 0 && (
                  <div className="mb-4 grid grid-cols-3 gap-2">
                    {newPostMediaPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        {preview.type.startsWith('video/') ? (
                          <video
                            src={preview.url}
                            className="w-full h-32 object-cover rounded-lg"
                            controls
                          />
                        ) : (
                          <img
                            src={preview.url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const newMedia = [...newPostMedia];
                            const newPreviews = [...newPostMediaPreviews];
                            newMedia.splice(index, 1);
                            newPreviews.splice(index, 1);
                            setNewPostMedia(newMedia);
                            setNewPostMediaPreviews(newPreviews);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPostModalOpen(false);
                      setNewPostDescription('');
                      setNewPostMedia([]);
                      setNewPostMediaPreviews([]);
                    }}
                    className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Post Modal */}
        {isEditPostModalOpen && editingPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Edit Post</h3>
              <form onSubmit={handleUpdatePost}>
                <div className="mb-4">
                  <textarea
                    value={editPostDescription}
                    onChange={(e) => setEditPostDescription(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                    rows="3"
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleEditPostMediaChange}
                    multiple
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-sm text-gray-500">You can select up to 3 files</p>
                </div>
                {editPostMediaPreviews.length > 0 && (
                  <div className="mb-4 grid grid-cols-3 gap-2">
                    {editPostMediaPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        {preview.type?.startsWith('video/') ? (
                          <video
                            src={preview.url}
                            className="w-full h-32 object-cover rounded-lg"
                            controls
                          />
                        ) : (
                          <img
                            src={preview.url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const newPreviews = [...editPostMediaPreviews];
                            newPreviews.splice(index, 1);
                            setEditPostMediaPreviews(newPreviews);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditPostModalOpen(false);
                      setEditingPost(null);
                      setEditPostDescription('');
                      setEditPostMedia([]);
                      setEditPostMediaPreviews([]);
                    }}
                    className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Update Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}