import React, { useEffect, useState } from 'react';

export default function NotificationsDashboard() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      setError('You must be logged in to view notifications.');
      setIsLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/notifications/user/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();
        console.log('Fetched notifications:', data);
        setNotifications(data || []);
      } catch (error) {
        setError(error.message || 'Error fetching notifications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update state locally without refetching
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error(error);
      setError(error.message || 'Error marking notification as read');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      // Update state locally without refetching
      setNotifications((prev) =>
        prev.filter((n) => n.notificationId !== notificationId)
      );
    } catch (error) {
      console.error(error);
      setError(error.message || 'Error deleting notification');
    }
  };

  if (isLoading) return <p>Loading notifications...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
  <div className="w-full max-w-3xl space-y-8 rounded-lg bg-white p-8 shadow-md">
    <h2 className="text-center text-2xl font-bold text-gray-900">Your Notifications</h2>

    {notifications.length === 0 ? (
      <p className="text-center text-gray-600">No notifications found.</p>
    ) : (
      <ul className="space-y-6">
        {notifications.map((notification) => (
          <li
            key={notification.notificationId}
            className="rounded-md border border-gray-200 p-4 shadow-sm hover:shadow-md transition duration-300"
          >
            <p className="mb-2"><span className="font-semibold">Description:</span> {notification.description}</p>
            <p className="mb-2"><span className="font-semibold">From User:</span> {notification.username}</p>
            <p className="mb-2"><span className="font-semibold">Time:</span> {new Date(notification.timestamp).toLocaleString()}</p>
            <p className="mb-4"><span className="font-semibold">Status:</span> {notification.isRead ? 'Read' : 'Unread'}</p>

            <div className="flex space-x-4">
              <button
                onClick={() => handleMarkAsRead(notification.notificationId)}
                disabled={notification.isRead}
                className={`rounded-md px-4 py-2 text-white ${
                  notification.isRead ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {notification.isRead ? 'Already Read' : 'Mark as Read'}
              </button>

              <button
                onClick={() => handleDelete(notification.notificationId)}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
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
