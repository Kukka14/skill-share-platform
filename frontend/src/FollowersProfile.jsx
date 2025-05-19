import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const FollowersProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [followStatus, setFollowStatus] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const BACKEND_URL = 'http://localhost:8080';

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
    fetchUserStatuses();
    fetchFollowStatus();
    fetchFollowingCount();
    fetchFollowersCount();
  }, [userId]);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/posts/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      setPosts(Array.isArray(data) ? data : (data._embedded?.postList || []));
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchUserStatuses = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/status/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch statuses');
      }

      const data = await response.json();
      // Filter statuses for the current user
      const userStatuses = data.filter(status => status.userId === userId);
      setStatuses(userStatuses);
    } catch (error) {
      console.error('Error fetching statuses:', error);
    }
  };

  const fetchFollowStatus = async () => {
    const token = localStorage.getItem('token');
    const currentUserId = localStorage.getItem('userId');
    if (!token || !currentUserId) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/follows/status?followerId=${currentUserId}&followedId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const isFollowing = await response.json();
        setFollowStatus(isFollowing);
      }
    } catch (error) {
      console.error('Error fetching follow status:', error);
    }
  };

  const fetchFollowingCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/follows/count?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const count = await response.json();
        setFollowingCount(count);
      }
    } catch (error) {
      console.error('Error fetching following count:', error);
    }
  };

  const fetchFollowersCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/follows/followers/count?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const count = await response.json();
        setFollowersCount(count);
      }
    } catch (error) {
      console.error('Error fetching followers count:', error);
    }
  };

  const handleFollowToggle = async () => {
    const token = localStorage.getItem('token');
    const currentUserId = localStorage.getItem('userId');
    
    if (!token || !currentUserId) {
      toast.error('You must be logged in to follow users');
      return;
    }
    
    try {
      const method = followStatus ? 'DELETE' : 'POST';
      const response = await fetch(`${BACKEND_URL}/api/follows?followerId=${currentUserId}&followedId=${userId}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to ${followStatus ? 'unfollow' : 'follow'} user`);
      }

      setFollowStatus(!followStatus);
      fetchFollowersCount();
      toast.success(`Successfully ${followStatus ? 'unfollowed' : 'followed'} user`);
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error(error.message);
    }
  };

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* User Profile Section */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-56 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end space-x-6">
                  <div className="h-36 w-36 rounded-full border-4 border-white overflow-hidden bg-white">
                    {userData?.profileImageUrl ? (
                      <img
                        src={getFullImageUrl(userData.profileImageUrl)}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl text-gray-500">
                        {userData?.firstName?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow pb-2">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {userData ? `${userData.firstName} ${userData.lastName}` : 'Loading...'}
                    </h1>
                    <p className="text-white text-opacity-90 text-lg">
                      {userData?.bio || 'No bio yet'}
                    </p>
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
                  {userId !== localStorage.getItem('userId') && (
                    <button
                      onClick={handleFollowToggle}
                      className={`px-4 py-2 rounded-md text-white font-medium ${
                        followStatus ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                    >
                      {followStatus ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <div className="flex justify-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold">{followingCount}</div>
                  <div className="text-gray-500">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{followersCount}</div>
                  <div className="text-gray-500">Followers</div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Section */}
          {statuses.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Statuses</h2>
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {statuses.map((status) => (
                  <div key={status.id} className="flex-shrink-0">
                    <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-blue-500">
                      {status.imageUrl && (
                        <img
                          src={getFullImageUrl(status.imageUrl)}
                          alt="Status"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <p className="mt-2 text-center text-sm text-gray-600 truncate w-20">
                      {status.text || 'No text'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts Section */}
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-4">
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
                  <div className="mt-4 text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="bg-white rounded-lg p-6 text-center text-gray-500">
              No posts available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersProfile; 