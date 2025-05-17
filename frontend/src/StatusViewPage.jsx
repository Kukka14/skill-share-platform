import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function StatusViewPage() {
  const { statusId } = useParams();
  const [status, setStatus] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const BACKEND_URL = 'http://localhost:8080';

  useEffect(() => {
    fetchStatuses();
  }, [statusId]);

  const fetchStatuses = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/status/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch statuses');

      const allStatuses = await response.json();
      console.log("All statuses:", allStatuses);

      const foundStatus = allStatuses.find((s) => String(s?.id) === String(statusId));

      if (!foundStatus) throw new Error('Status not found');

      setStatus(foundStatus);
      fetchUserData(foundStatus.user?.id);
    } catch (err) {
      setError(err.message);
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

      if (!response.ok) throw new Error('Failed to fetch user');

      const data = await response.json();
      setUserData(data);
    } catch (err) {
      console.error('User fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
  };

  if (isLoading) return <div className="p-6 text-center">Loading...</div>;

  if (error || !status)
    return <div className="p-6 text-center text-red-500">{error || 'Status not found.'}</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-2xl px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            {/* <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              {userData?.profileImageUrl ? (
                <img
                  src={getFullImageUrl(userData.profileImageUrl)}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-600 text-xl">
                  {userData?.firstName?.charAt(0) || '?'}
                </div>
              )}
            </div> */}
            <div>
              <p className="font-semibold text-gray-800">
                {userData ? `${userData.firstName} ${userData.lastName}` : ''}
              </p>
              {status?.createdAt && (
                <p className="text-sm text-gray-500">
                  {new Date(status.createdAt).toLocaleDateString()} at{' '}
                  {new Date(status.createdAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          {status?.text && <p className="text-gray-700 mb-4">{status.text}</p>}

          {status?.imageUrl && (
            <img
              src={getFullImageUrl(status.imageUrl)}
              alt="Status"
              className="w-full h-72 object-cover rounded-lg"
            />
          )}

          <div className="mt-4 flex items-center space-x-6 border-t pt-4 text-gray-500">
            <button className="hover:text-blue-600 flex items-center space-x-1">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
              <span>Like</span>
            </button>

            <button className="hover:text-blue-600 flex items-center space-x-1">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M21 16.5A2.5 2.5 0 0118.5 19H6l-4 4V5.5A2.5 2.5 0 014.5 3h13A2.5 2.5 0 0120 5.5v11z" />
              </svg>
              <span>Comment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
