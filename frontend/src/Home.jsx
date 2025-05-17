import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';


export default function Home() {
  const [posts, setPosts] = useState([]);
  const [postsWithUserData, setPostsWithUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const BACKEND_URL = 'http://localhost:8080';

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      fetchUserDataForPosts();
    }
  }, [posts]);

  //added by nethmi 
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
                    <button className="flex items-center text-gray-500 hover:text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Comment
                    </button>
                    <button className="flex items-center text-gray-500 hover:text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                  </div>
                </div>
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