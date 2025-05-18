import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function PostViewPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const BACKEND_URL = 'http://localhost:8080';

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }

      const data = await response.json();
      setPost(data);
      fetchUserData(data.userId);
    } catch (error) {
      setError('Failed to load post: ' + error.message);
      setIsLoading(false);
    }
  };

  const fetchUserData = async (userId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('User fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error || !post) {
    return <div className="p-8 text-center text-red-600">{error || 'Post not found.'}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
              {userData?.profileImageUrl ? (
                <img
                  src={getFullImageUrl(userData.profileImageUrl)}
                  alt={`${userData.firstName}'s profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xl text-gray-500">
                  {userData?.firstName?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {userData ? `${userData.firstName} ${userData.lastName}` : 'Unknown User'}
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
                        post.mediaUrls.length === 1 ? 'h-96' : 'h-64'
                      } object-cover rounded-lg`}
                      controls
                    />
                  ) : (
                    <img
                      src={getFullImageUrl(url)}
                      alt={`Post media ${index + 1}`}
                      className={`w-full ${
                        post.mediaUrls.length === 1 ? 'h-96' : 'h-64'
                      } object-cover rounded-lg`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t pt-4">
  <div className="flex items-center space-x-8">
    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.657l-6.828-6.829a4 4 0 010-5.656z" />
      </svg>
      <span>Like</span>
    </button>

    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 16.5A2.5 2.5 0 0118.5 19H6l-4 4V5.5A2.5 2.5 0 014.5 3h13A2.5 2.5 0 0120 5.5v11z" />
      </svg>
      <span>Comment</span>
    </button>

    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M4 20l16-16" />
      </svg>
      <span>Share</span>
    </button>
  </div>
</div>


          {/* You can later add LikeCount, CommentList, CommentForm etc. here */}
        </div>
      </div>
    </div>
  );
}
