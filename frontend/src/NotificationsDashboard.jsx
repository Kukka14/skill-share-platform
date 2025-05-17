import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function NotificationsDashboard() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ id: '' });
  const navigate = useNavigate();


  const token = localStorage.getItem('token');

  // 1️⃣ Fetch user data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setError('Unauthorized. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:8080/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch user');

        const data = await res.json();
        setUserData(data);
      } catch (err) {
        setError(err.message || 'Error fetching user');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  // 2️⃣ Save userId to localStorage
  useEffect(() => {
    if (userData.id) {
      console.log('User ID:', userData.id);
      localStorage.setItem('userId', userData.id);
    }
  }, [userData.id]);

  // 3️⃣ Fetch notifications and their related posts
  useEffect(() => {
    if (!token || !userData.id) return;

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/notifications/user/${userData.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to fetch notifications');
        }

        const data = await response.json();
        const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Fetch post data for each notification
        const notificationsWithPosts = await Promise.all(
          sortedData.map(async (notif) => {
            if (!notif.postId) return notif;

            try {
              const postRes = await fetch(`http://localhost:8080/api/posts/${notif.postId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (!postRes.ok) throw new Error('Failed to fetch post');
              const postData = await postRes.json();
              return { ...notif, post: postData };
            } catch (error) {
              console.error(`Error fetching post for notification ${notif.notificationId}:`, error);
              return notif;
            }
          })
        );

        setNotifications(notificationsWithPosts);
      } catch (err) {
        setError(err.message || 'Error loading notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token, userData.id]);

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to mark as read');

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notificationId === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      alert('Error updating notification: ' + err.message);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete notification');

      setNotifications((prev) =>
        prev.filter((notif) => notif.notificationId !== notificationId)
      );
    } catch (err) {
      alert('Error deleting notification: ' + err.message);
    }
  };

  if (loading) return <p>Loading notifications...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

 return (
  <div className="min-h-screen bg-gray-50 py-10 px-6 md:px-20">
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-semibold text-black-800 mb-6 border-b pb-3"><b > Notifications</b></h2>

      {notifications.length === 0 ? (
        <p className="text-gray-600">No notifications found.</p>
      ) : (
        <ul className="space-y-6">
          {notifications.map((notif) => (
            <li
              key={notif.notificationId}
              className={`p-5 rounded-xl shadow-md border transition-all duration-200 cursor-pointer ${
                notif.read ? 'bg-gray-100 hover:bg-gray-200' : 'bg-blue-50 hover:bg-blue-100'
              }`}
              onClick={() => {
                if (notif.statusId) {
                  navigate(`/status/${notif.statusId}`);
                } else if (notif.postId) {
                  navigate(`/posts/${notif.postId}`);
                }
              }}
            >
              <p className="font-semibold text-gray-800">{notif.description}</p>
              <p className="text-sm mt-1">
                Status:{' '}
                <span className={notif.read ? 'text-green-600' : 'text-red-500 font-semibold'}>
                  {notif.read ? 'Read' : 'Not Read'}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Time: {new Date(notif.timestamp).toLocaleString()}
              </p>

              {/* Post Media */}
              {notif.post?.mediaUrls?.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {notif.post.mediaUrls.map((url, idx) => {
                    const type = notif.post.mediaTypes?.[idx] || '';
                    const fullUrl = `http://localhost:8080${url}`;
                    return type.startsWith('image/') ? (
                      <img
                        key={idx}
                        src={fullUrl}
                        alt="Post Media"
                        className="rounded-xl object-cover w-full h-40"
                      />
                    ) : type.startsWith('video/') ? (
                      <video
                        key={idx}
                        src={fullUrl}
                        controls
                        className="rounded-xl object-cover w-full h-40"
                      />
                    ) : null;
                  })}
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notif.notificationId);
                  }}
                  disabled={notif.read}
                  className={`px-4 py-1.5 rounded-lg text-white text-sm font-medium ${
                    notif.read
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-green-700'
                  }`}
                >
                  Mark as Read
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.notificationId);
                  }}
                  className="px-4 py-1.5 rounded-lg text-white text-sm font-medium bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

}
