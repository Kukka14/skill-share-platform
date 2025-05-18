import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotificationsDashboard() {
  const [notifications, setNotifications] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterType, setFilterType] = useState('All');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ id: '' });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setError('Unauthorized. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:8080/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
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

  useEffect(() => {
    if (userData.id) localStorage.setItem('userId', userData.id);
  }, [userData.id]);

  useEffect(() => {
    if (!token || !userData.id) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/notifications/user/${userData.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch notifications');
        const data = await res.json();
        const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const withPosts = await Promise.all(
          sortedData.map(async (notif) => {
            if (!notif.postId) return notif;
            try {
              const postRes = await fetch(`http://localhost:8080/api/posts/${notif.postId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (!postRes.ok) throw new Error();
              const postData = await postRes.json();
              return { ...notif, post: postData };
            } catch {
              return notif;
            }
          })
        );

        setNotifications(withPosts);
        setFiltered(withPosts); // initially show all
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Error loading notifications');
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token, userData.id]);

  // ✅ Updated filtering logic
  // useEffect(() => {
  //   if (filterType === 'All') {
  //     setFiltered(notifications);
  //   } else if (filterType === 'Post') {
  //     setFiltered(notifications.filter(n => n.postId));
  //   } else if (filterType === 'Status') {
  //     setFiltered(notifications.filter(n => n.statusId));
      
  //   } else if (filterType === 'Comment') {
  //     setFiltered(notifications.filter(n => n.commentId));
  //   }else if (filterType === 'Like') {
  //     setFiltered(notifications.filter(n => n.likeId));
  //   }
    
  // else {
  //     setFiltered(notifications.filter(n => n.type === filterType));
  //   }
  // }, [filterType, notifications]);



  useEffect(() => {
  let temp = notifications;

  // Filter by type
  if (filterType === 'Post') temp = temp.filter(n => n.postId);
  else if (filterType === 'Status') temp = temp.filter(n => n.statusId);
  else if (filterType === 'Comment') temp = temp.filter(n => n.commentId);
  else if (filterType === 'Like') temp = temp.filter(n => n.likeId);
  else if (filterType !== 'All') temp = temp.filter(n => n.type === filterType);

  // Filter by search
  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    temp = temp.filter(n =>
      n.description?.toLowerCase().includes(query) ||
      n.type?.toLowerCase().includes(query)
    );
  }

  setFiltered(temp);
}, [filterType, searchQuery, notifications]);


  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, read: true } : n))
      );
    } catch {
      alert('Error marking as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
    } catch {
      alert('Error deleting notification');
    }
  };

  const groupByDate = (list) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isSameDay = (a, b) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    const grouped = { today: [], yesterday: [], earlier: [] };

    list.forEach((n) => {
      const date = new Date(n.timestamp);
      if (isSameDay(date, today)) grouped.today.push(n);
      else if (isSameDay(date, yesterday)) grouped.yesterday.push(n);
      else grouped.earlier.push(n);
    });

    return grouped;
  };

  const grouped = groupByDate(filtered);

  const renderGroup = (title, items) => (
    <>
      {items.length > 0 && <h3 className="text-lg font-semibold mt-6 mb-2">{title}</h3>}
      <ul className="space-y-6">
        {items.map((notif) => (
          <li
            key={notif.notificationId}
            className={`p-5 rounded-xl shadow-md border cursor-pointer transition ${
              notif.read ? 'bg-gray-100 hover:bg-gray-200' : 'bg-blue-50 hover:bg-blue-100'
            }`}
            onClick={() => {
              if (notif.statusId) navigate(`/status/${notif.statusId}`);
              else if (notif.postId) navigate(`/posts/${notif.postId}`);
            }}
          >
            <p className="font-semibold">{notif.description}</p>
            <p className="text-sm mt-1">
              Status:{' '}
              <span className={notif.read ? 'text-green-600' : 'text-red-500 font-semibold'}>
                {notif.read ? 'Read' : 'Not Read'}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Time: {new Date(notif.timestamp).toLocaleString()}
            </p>

            {notif.post?.mediaUrls?.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {notif.post.mediaUrls.map((url, idx) => {
                  const type = notif.post.mediaTypes?.[idx] || '';
                  const fullUrl = `http://localhost:8080${url}`;
                  return type.startsWith('image/') ? (
                    <img key={idx} src={fullUrl} className="rounded-xl w-full h-40 object-cover" />
                  ) : type.startsWith('video/') ? (
                    <video key={idx} src={fullUrl} controls className="rounded-xl w-full h-40" />
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
                  notif.read ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
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
    </>
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 md:px-20">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-semibold text-black-800 mb-6 border-b pb-3">Notifications</h2>

        <div className="mb-4">
  <input
    type="text"
    placeholder="Search notifications..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full md:w-1/2 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>


        {/* 🔘 Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          {['All', 'Post', 'Status', 'Like', 'Comment'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                filterType === type
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-500">No notifications found.</p>
        ) : (
          <>
            {renderGroup('Today', grouped.today)}
            {renderGroup('Yesterday', grouped.yesterday)}
            {renderGroup('Earlier', grouped.earlier)}
          </>
        )}
      </div>
    </div>
  );
}
