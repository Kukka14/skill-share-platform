import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function PostViewPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Post not found');

        const data = await res.json();
        setPost(data);
      } catch (err) {
        setError(err.message || 'Error fetching post');
      }
    };

    fetchPost();
  }, [postId, token]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!post) return <p>Loading post...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Post Details</h2>

      {post.mediaUrls?.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {post.mediaUrls.map((url, idx) => {
            const type = post.mediaTypes?.[idx] || '';
            const fullUrl = `http://localhost:8080${url}`;

            return type.startsWith('image/') ? (
              <img
                key={idx}
                src={fullUrl}
                alt="Post Media"
                className="w-full h-48 object-cover rounded"
              />
            ) : type.startsWith('video/') ? (
              <video
                key={idx}
                src={fullUrl}
                controls
                className="w-full h-48 object-cover rounded"
              />
            ) : null;
          })}
        </div>
      )}

      <p className="text-lg">{post.description || 'No description available.'}</p>
    </div>
  );
}
