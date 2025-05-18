import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';


export default function Home() {
  const [posts, setPosts] = useState([]);
  const [postsWithUserData, setPostsWithUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const BACKEND_URL = 'http://localhost:8080';
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [likedPosts, setLikedPosts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [comments, setComments] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showComments, setShowComments] = useState({});

  const getCurrentUserId = () => {
    if (user?.id) return user.id;
    if (user?._id) return user._id;
    const storedId = localStorage.getItem('userId');
    if (storedId) return storedId;
    console.error('Could not determine current user ID', user);
    return null;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchPosts();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (posts.length > 0) {
      fetchUserDataForPosts();
    } else {
      setIsLoading(false);
    }
  }, [posts]);

  useEffect(() => {
    if (postsWithUserData.length > 0 && postsWithUserData[0].userData?.id) {
      console.log('User ID:', postsWithUserData[0].userData.id);
      localStorage.setItem('userId', postsWithUserData[0].userData.id);
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
            
            const userLiked = Array.isArray(likes) && likes.some(like => like.userId === currentUserId);
            newLikedPosts[post.id] = userLiked;
          } else {
            console.error(`Error fetching likes for post ${post.id}:`, await likesResponse.text());
          }
        } catch (error) {
          console.error(`Error fetching like data for post ${post.id}:`, error);
        }
      }));
      
      console.log('Liked posts map:', newLikedPosts);
      console.log('Like counts map:', newLikeCounts);
      
      setLikedPosts(newLikedPosts);
      setLikeCounts(newLikeCounts);
    } catch (error) {
      console.error('Error fetching like status:', error);
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
      
      if (likedPosts[postId]) {
        const response = await fetch(`${BACKEND_URL}/api/interactions/posts/${postId}/like?userId=${currentUserId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const responseText = await response.text();
        console.log('Response from unlike:', responseText);
        
        if (response.ok) {
          console.log('Successfully unliked post');
          setLikedPosts(prev => ({ ...prev, [postId]: false }));
          setLikeCounts(prev => ({ ...prev, [postId]: Math.max(0, (prev[postId] || 1) - 1) }));
        } else {
          console.error('Error unliking post:', responseText);
          alert(`Failed to unlike post: ${responseText || 'Unknown error'}`);
        }
      } else {
        const response = await fetch(`${BACKEND_URL}/api/interactions/posts/${postId}/like?userId=${currentUserId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const responseText = await response.text();
        console.log('Response from like:', responseText);
        
        if (response.ok) {
          console.log('Successfully liked post');
          setLikedPosts(prev => ({ ...prev, [postId]: true }));
          setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
        } else {
          console.error('Error liking post:', responseText);
          alert(`Failed to like post: ${responseText || 'Unknown error'}`);
        }
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

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-red-700">
              {error}
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
                  <div>
                    <p className="text-xs text-gray-400">User ID: {post.userId}</p>
                    <p className="font-medium text-gray-900">
                      {post.userData ? `${post.userData.firstName} ${post.userData.lastName}` : 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill={likedPosts[post.id] ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Like {likeCounts[post.id] > 0 && `(${likeCounts[post.id]})`}
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
                              <p className="text-xs font-medium">
                                {comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Unknown User'}
                              </p>
                              <p className="text-sm">{comment.content}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleString()}
                              </p>
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