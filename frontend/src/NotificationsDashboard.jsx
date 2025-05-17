import React, { useEffect, useState } from 'react';

export default function NotificationsDashboard() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ id: '' });

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

  // 3️⃣ Fetch notifications *after* userId is available
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
        setNotifications(sortedData);
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
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notif) => (
            <li
              key={notif.notificationId}
              className={`p-4 rounded shadow ${notif.read ? 'bg-gray-200' : 'bg-blue-100'}`}
            >
              <p className="font-medium">{notif.description}</p>
              <p className="text-sm text-gray-600">
                Status:{' '}
                <span className={notif.read ? 'text-green-600' : 'text-red-600'}>
                  {notif.read ? 'Read' : 'Not Read'}
                </span>
              </p>
              <p className="text-xs text-gray-500">
                Time: {new Date(notif.timestamp).toLocaleString()}
              </p>

              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => markAsRead(notif.notificationId)}
                  disabled={notif.read}
                  className={`px-3 py-1 rounded text-white ${
                    notif.read
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Mark as Read
                </button>

                <button
                  onClick={() => deleteNotification(notif.notificationId)}
                  className="px-3 py-1 rounded text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
