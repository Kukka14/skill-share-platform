import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [postsWithUserData, setPostsWithUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const BACKEND_URL = 'http://localhost:8080';

  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [postComments, setPostComments] = useState({});
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      fetchUserDataForPosts();
    }
  }, [posts]);

  useEffect(() => {
    if (postsWithUserData.length > 0 && postsWithUserData[0].userData?.id) {
      console.log('User ID:', postsWithUserData[0].userData.id);
      localStorage.setItem('userId', postsWithUserData[0].userData.id);
    }
  }, [postsWithUserData]);

  const fetchPosts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

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
      const postList = data._embedded?.postList || [];
      setPosts(postList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      setError('Failed to load posts: ' + error.message);
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
      setError('Failed to load user data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPostComments = async (postId) => {
    setIsLoadingComments(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/interactions/posts/${postId}/comments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const comments = await response.json();
      setPostComments(prev => ({
        ...prev,
        [postId]: comments
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !commentingPostId) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      console.log(`Submitting comment for post: ${commentingPostId}`);
      console.log(`Comment content: ${commentText}`);
      
      const response = await fetch(`${BACKEND_URL}/api/interactions/posts/${commentingPostId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: commentText })
      });
      
      const contentType = response.headers.get("content-type");
      let errorData;
      
      if (contentType && contentType.indexOf("application/json") !== -1) {
        errorData = await response.json();
      } else {
        errorData = await response.text();
      }
      
      if (!response.ok) {
        console.error('Comment submission error:', response.status, errorData);
        throw new Error(`Failed to add comment: ${response.status} ${JSON.stringify(errorData)}`);
      }
      
      const newComment = errorData; // Since we already parsed the response
      console.log('New comment created:', newComment);
      
      // Update local comments state
      setPostComments(prev => ({
        ...prev,
        [commentingPostId]: [newComment, ...(prev[commentingPostId] || [])]
      }));
      
      // Reset form
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment: ' + error.message);
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
    setIsEditingComment(true);
  };

  const handleSubmitEditComment = async (e) => {
    e.preventDefault();
    if (!editingCommentText.trim() || !editingCommentId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/interactions/comments/${editingCommentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: editingCommentText
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update comment');
      }

      const updatedComment = await response.json();

      setPostComments(prev => {
        const allComments = { ...prev };
        for (const postId in allComments) {
          allComments[postId] = allComments[postId].map(comment =>
            comment.id === updatedComment.id ? updatedComment : comment
          );
        }
        return allComments;
      });

      setIsEditingComment(false);
      setEditingCommentId(null);
      setEditingCommentText('');
    } catch (error) {
      console.error('Error updating comment:', error);
      setError('Failed to update comment: ' + error.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
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

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to delete comment');
      }

      setPostComments(prev => {
        const allComments = { ...prev };
        for (const postId in allComments) {
          allComments[postId] = allComments[postId].filter(comment => comment.id !== commentId);
        }
        return allComments;
      });

      setError('Comment deleted successfully');
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment: ' + error.message);
    }
  };

  const openCommentModal = (postId) => {
    setCommentingPostId(postId);
    setIsCommentModalOpen(true);
    fetchPostComments(postId);
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
                        {post.mediaTypes[index]?.startsWith('video/') ? (
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
                    <button className="flex items-center text-gray-500 hover:text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Like
                    </button>
                    <button 
                      onClick={() => openCommentModal(post.id)}
                      className="flex items-center text-gray-500 hover:text-blue-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Comment
                    </button>
                  </div>
                </div>

                {postComments[post.id] && postComments[post.id].length > 0 && (
                  <div className="mt-3 px-4 pb-4">
                    <div className="mt-2 text-sm text-gray-500">
                      {postComments[post.id].length} comment{postComments[post.id].length !== 1 ? 's' : ''}
                    </div>

                    <div className="mt-2 pt-2 border-t">
                      <div className="flex items-start space-x-2">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          {postComments[post.id][0].user?.profileImageUrl ? (
                            <img
                              src={getFullImageUrl(postComments[post.id][0].user.profileImageUrl)}
                              alt="User"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                              {postComments[post.id][0].user?.firstName?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div className="bg-gray-100 rounded-xl px-3 py-2 flex-1">
                          <p className="font-medium text-sm">{postComments[post.id][0].user?.username || 'User'}</p>
                          <p className="text-sm">{postComments[post.id][0].content}</p>
                        </div>
                      </div>
                      {postComments[post.id].length > 1 && (
                        <button 
                          onClick={() => openCommentModal(post.id)}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          View all {postComments[post.id].length} comments
                        </button>
                      )}
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

      {isCommentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Comments</h3>

            <div className="flex-1 overflow-y-auto mb-4">
              {isLoadingComments ? (
                <div className="text-center py-4">Loading comments...</div>
              ) : postComments[commentingPostId]?.length > 0 ? (
                <div className="space-y-4">
                  {postComments[commentingPostId].map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {comment.user?.profileImageUrl ? (
                          <img
                            src={getFullImageUrl(comment.user.profileImageUrl)}
                            alt="User"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg text-gray-500">
                            {comment.user?.firstName?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="bg-gray-100 rounded-xl px-4 py-3 flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{comment.user?.username || 'User'}</p>
                          <div className="flex items-center">
                            <p className="text-xs text-gray-500 mr-2">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>

                            {localStorage.getItem('userId') === comment.userId && (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleEditComment(comment)}
                                  className="text-gray-500 hover:text-blue-600"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-gray-500 hover:text-red-600"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {isEditingComment && editingCommentId === comment.id ? (
                          <form onSubmit={handleSubmitEditComment} className="mt-1">
                            <textarea
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none text-sm"
                              rows="2"
                            />
                            <div className="flex justify-end space-x-2 mt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsEditingComment(false);
                                  setEditingCommentId(null);
                                }}
                                className="text-xs px-2 py-1 rounded bg-gray-300 hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                              >
                                Save
                              </button>
                            </div>
                          </form>
                        ) : (
                          <p className="mt-1">{comment.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitComment} className="mt-auto">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {postsWithUserData[0]?.userData?.profileImageUrl ? (
                    <img
                      src={getFullImageUrl(postsWithUserData[0].userData.profileImageUrl)}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                      {postsWithUserData[0]?.userData?.firstName?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className={`rounded-full p-2 ${
                    commentText.trim() 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setIsCommentModalOpen(false)}
                className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}