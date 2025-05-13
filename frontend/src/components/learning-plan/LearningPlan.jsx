import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const BACKEND_URL = 'http://localhost:8080';

const LearningPlan = () => {
  const location = useLocation();
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [allPlans, setAllPlans] = useState([]);
  const [filteredAllPlans, setFilteredAllPlans] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    goals: [''],
    isPublic: false,
  });
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [tab, setTab] = useState('my'); // 'my' or 'all'
  const [userMap, setUserMap] = useState({}); // { userId: { firstName, lastName, profileImageUrl } }
  const [myUser, setMyUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Add search filter effect
  useEffect(() => {
    const filterPlans = (plansToFilter) => {
      if (!searchQuery.trim()) {
        return plansToFilter;
      }
      const query = searchQuery.toLowerCase();
      return plansToFilter.filter(plan => {
        const titleMatch = plan.title.toLowerCase().includes(query);
        const descriptionMatch = plan.description.toLowerCase().includes(query);
        const goalsMatch = plan.topics?.some(topic => 
          topic.name.toLowerCase().includes(query)
        );
        return titleMatch || descriptionMatch || goalsMatch;
      });
    };

    setFilteredPlans(filterPlans(plans));
    setFilteredAllPlans(filterPlans(allPlans));
  }, [searchQuery, plans, allPlans]);

  const fetchPlans = async () => {
    const token = localStorage.getItem('token');
    if (!token || !userId) return;
    setLoading(true);
    setError('');
    try {
      if (tab === 'my') {
        const res = await fetch(`${BACKEND_URL}/api/learning-plans/user/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch learning plans');
        const data = await res.json();
        setPlans(data);
        setFilteredPlans(data);
      } else {
        const res = await fetch(`${BACKEND_URL}/api/learning-plans/public`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch public learning plans');
        const data = await res.json();
        setAllPlans(data);
        setFilteredAllPlans(data);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Reset state and fetch data when route changes
  useEffect(() => {
    const resetAndFetchData = async () => {
      setPlans([]);
      setFilteredPlans([]);
      setAllPlans([]);
      setFilteredAllPlans([]);
      setUserMap({});
      setMyUser(null);
      setLoading(true);
      setError('');
      setSearchQuery('');
      // Get current user ID
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${BACKEND_URL}/api/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch user info');
        const data = await res.json();
        const currentUserId = data.id;
        setUserId(currentUserId);
        localStorage.setItem('userId', currentUserId);
        setMyUser(data);
        await fetchPlans();
      } catch (err) {
        setError('Failed to load data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    resetAndFetchData();
    return () => {
      setPlans([]);
      setFilteredPlans([]);
      setAllPlans([]);
      setFilteredAllPlans([]);
      setUserMap({});
      setMyUser(null);
      setLoading(true);
      setError('');
    };
  }, [location.pathname, tab]);

  // Fetch user info for all public plans
  useEffect(() => {
    if (tab === 'all' && allPlans.length > 0) {
      const uniqueUserIds = [...new Set(allPlans.map(plan => plan.creatorId).filter(Boolean))];
      const token = localStorage.getItem('token');
      Promise.all(uniqueUserIds.map(userId =>
        fetch(`${BACKEND_URL}/api/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => ({ userId, data }))
      )).then(results => {
        const map = {};
        results.forEach(({ userId, data }) => {
          if (data) map[userId] = data;
        });
        setUserMap(map);
      });
    }
  }, [tab, allPlans]);

  const handleAddGoal = () => {
    setNewPlan(prev => ({
      ...prev,
      goals: [...prev.goals, '']
    }));
  };

  const handleGoalChange = (index, value) => {
    const updatedGoals = [...newPlan.goals];
    updatedGoals[index] = value;
    setNewPlan(prev => ({
      ...prev,
      goals: updatedGoals
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    if (!token || !userId) return;
    // Convert date to ISO datetime string
    const endDateTime = newPlan.endDate ? newPlan.endDate + 'T23:59:59' : null;
    // Prepare topics as goals (simple mapping)
    const topics = newPlan.goals.filter(g => g.trim()).map(goal => ({
      name: goal,
      description: '',
      resources: [],
      targetCompletionDate: endDateTime,
      isCompleted: false
    }));
    const payload = {
      title: newPlan.title,
      description: newPlan.description,
      topics,
      targetCompletionDate: endDateTime,
      isPublic: newPlan.isPublic,
    };
    try {
      const res = await fetch(`${BACKEND_URL}/api/learning-plans?creatorId=${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to create learning plan');
      setNewPlan({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        goals: [''],
        isPublic: false,
      });
      await fetchPlans();
    } catch (err) {
      setError('Failed to create learning plan');
    }
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this learning plan?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/learning-plans/${planId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete learning plan');
      await fetchPlans();
    } catch (err) {
      setError('Failed to delete learning plan');
    }
  };

  const openEditModal = (plan) => {
    setEditPlan({
      ...plan,
      startDate: plan.createdAt ? plan.createdAt.split('T')[0] : '',
      endDate: plan.targetCompletionDate ? plan.targetCompletionDate.split('T')[0] : '',
      goals: plan.topics ? plan.topics.map(t => t.name) : [''],
      isPublic: !!plan.isPublic,
    });
    setEditModalOpen(true);
  };

  const handleEditGoalChange = (index, value) => {
    const updatedGoals = [...editPlan.goals];
    updatedGoals[index] = value;
    setEditPlan(prev => ({ ...prev, goals: updatedGoals }));
  };

  const handleAddEditGoal = () => {
    setEditPlan(prev => ({ ...prev, goals: [...prev.goals, ''] }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    if (!token || !editPlan) return;
    const endDateTime = editPlan.endDate ? editPlan.endDate + 'T23:59:59' : null;
    const topics = editPlan.goals.filter(g => g.trim()).map(goal => ({
      name: goal,
      description: '',
      resources: [],
      targetCompletionDate: endDateTime,
      isCompleted: false
    }));
    const payload = {
      title: editPlan.title,
      description: editPlan.description,
      topics,
      targetCompletionDate: endDateTime,
      isPublic: editPlan.isPublic,
    };
    try {
      const res = await fetch(`${BACKEND_URL}/api/learning-plans/${editPlan.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to update learning plan');
      setEditModalOpen(false);
      setEditPlan(null);
      await fetchPlans();
    } catch (err) {
      setError('Failed to update learning plan');
    }
  };

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
  };

  // Add this before the return statement
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-5xl mx-auto p-4 sm:p-8 relative">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Learning Plan Wall</h1>
          <p className="text-lg text-gray-500 font-medium">Create, track, and share your learning journeys with the community.</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search plans by title, description, or goals..."
              className="w-full px-4 py-3 pl-12 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="mb-8 flex justify-center space-x-4">
          <button
            className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 shadow-sm ${tab === 'my' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
            onClick={() => setTab('my')}
          >
            My Learning Plans
          </button>
          <button
            className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 shadow-sm ${tab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
            onClick={() => setTab('all')}
          >
            Public Learning Plans
          </button>
        </div>

        {/* Floating Action Button for Add Plan (only for My Plans) */}
        {tab === 'my' && (
          <button
            className="fixed bottom-10 right-10 z-50 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 group"
            onClick={() => setShowCreateModal(true)}
            title="Create New Learning Plan"
            style={{
              boxShadow: '0 8px 24px 0 rgba(37, 99, 235, 0.2)',
              transform: 'translateY(0)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 28px 0 rgba(37, 99, 235, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px 0 rgba(37, 99, 235, 0.2)';
            }}
          >
            <div className="flex items-center space-x-2">
              <FaPlus className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
              <span className="font-semibold text-sm hidden sm:inline-block">New Plan</span>
            </div>
            <div className="absolute -top-12 right-0 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Create New Learning Plan
              <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
            </div>
          </button>
        )}

        {error && <div className="mb-4 text-red-600 text-center font-medium">{error}</div>}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
                onClick={() => setShowCreateModal(false)}
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-6 text-center">Create New Learning Plan</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newPlan.title}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newPlan.description}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={newPlan.startDate}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={newPlan.endDate}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Learning Goals</label>
                  {newPlan.goals.map((goal, index) => (
                    <div key={index} className="mb-2">
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) => handleGoalChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Goal ${index + 1}`}
                        required
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddGoal}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Another Goal
                  </button>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!!newPlan.isPublic}
                    onChange={e => setNewPlan(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="mr-2"
                    id="isPublic"
                  />
                  <label htmlFor="isPublic" className="text-sm text-gray-700">Make this plan public</label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold text-lg"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Create Learning Plan'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* My Learning Plans */}
        {tab === 'my' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading ? (
              <div className="col-span-2 flex justify-center items-center h-40"><span className="loader"></span></div>
            ) : filteredPlans.length === 0 ? (
              <div className="col-span-2 text-gray-500 text-center">
                {searchQuery ? 'No matching learning plans found.' : 'No learning plans found.'}
              </div>
            ) : (
              filteredPlans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-2xl shadow-lg p-7 relative group transition-transform hover:-translate-y-1 hover:shadow-2xl border border-gray-100">
                  {plan.isPublic && (
                    <span className="absolute top-4 right-4 bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-bold shadow-sm">Public</span>
                  )}
                  <div className="flex items-center mb-3">
                    {myUser && myUser.profileImageUrl ? (
                      <img src={getFullImageUrl(myUser.profileImageUrl)} alt="avatar" className="h-11 w-11 rounded-full object-cover border-2 border-blue-200 shadow-sm" />
                    ) : (
                      <div className="h-11 w-11 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500 border-2 border-blue-200 shadow-sm">
                        {myUser ? myUser.firstName.charAt(0) : '?'}
                      </div>
                    )}
                    <div className="ml-3">
                      <div className="font-semibold text-gray-900 text-lg">{myUser ? `${myUser.firstName} ${myUser.lastName}` : 'Me'}</div>
                      <div className="text-xs text-gray-500">{plan.createdAt ? new Date(plan.createdAt).toLocaleString() : ''}</div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 truncate">{plan.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{plan.description}</p>
                  <div className="flex justify-between text-sm mb-4">
                    <div>
                      <span className="font-medium text-gray-500">Start:</span> {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : '-'}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Target:</span> {plan.targetCompletionDate ? new Date(plan.targetCompletionDate).toLocaleDateString() : '-'}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Learning Goals:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {plan.topics && plan.topics.length > 0 ? plan.topics.map((topic, index) => (
                        <li key={index} className="text-gray-700">{topic.name}</li>
                      )) : <li className="text-gray-400">No goals</li>}
                    </ul>
                  </div>
                  <div className="flex justify-end space-x-2 mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(plan)}
                      className="px-4 py-2 text-sm bg-yellow-400 text-white rounded-lg font-semibold hover:bg-yellow-500 shadow transition-colors duration-150"
                    >Edit</button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 shadow transition-colors duration-150"
                    >Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* All Learning Plans */}
        {tab === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading ? (
              <div className="col-span-2 flex justify-center items-center h-40"><span className="loader"></span></div>
            ) : filteredAllPlans.length === 0 ? (
              <div className="col-span-2 text-gray-500 text-center">
                {searchQuery ? 'No matching public learning plans found.' : 'No public learning plans found.'}
              </div>
            ) : (
              filteredAllPlans.map((plan) => {
                const user = userMap[plan.creatorId];
                return (
                  <div key={plan.id} className="bg-white rounded-2xl shadow-lg p-7 relative group transition-transform hover:-translate-y-1 hover:shadow-2xl border border-gray-100">
                    {plan.isPublic && (
                      <span className="absolute top-4 right-4 bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-bold shadow-sm">Public</span>
                    )}
                    <div className="flex items-center mb-3">
                      {user && user.profileImageUrl ? (
                        <img src={getFullImageUrl(user.profileImageUrl)} alt="avatar" className="h-11 w-11 rounded-full object-cover border-2 border-blue-200 shadow-sm" />
                      ) : (
                        <div className="h-11 w-11 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500 border-2 border-blue-200 shadow-sm">
                          {user ? user.firstName.charAt(0) : '?'}
                        </div>
                      )}
                      <div className="ml-3">
                        <div className="font-semibold text-gray-900 text-lg">{user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}</div>
                        <div className="text-xs text-gray-500">{plan.createdAt ? new Date(plan.createdAt).toLocaleString() : ''}</div>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 truncate">{plan.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{plan.description}</p>
                    <div className="flex justify-between text-sm mb-4">
                      <div>
                        <span className="font-medium text-gray-500">Start:</span> {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : '-'}
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Target:</span> {plan.targetCompletionDate ? new Date(plan.targetCompletionDate).toLocaleDateString() : '-'}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Learning Goals:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {plan.topics && plan.topics.length > 0 ? plan.topics.map((topic, index) => (
                          <li key={index} className="text-gray-700">{topic.name}</li>
                        )) : <li className="text-gray-400">No goals</li>}
                      </ul>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Edit Modal (reuse your existing modal code) */}
        {editModalOpen && editPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit Learning Plan</h3>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-gray-500 hover:text-red-600 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editPlan.title}
                    onChange={e => setEditPlan(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editPlan.description}
                    onChange={e => setEditPlan(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={editPlan.startDate}
                      onChange={e => setEditPlan(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={editPlan.endDate}
                      onChange={e => setEditPlan(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Learning Goals</label>
                  {editPlan.goals.map((goal, index) => (
                    <div key={index} className="mb-2">
                      <input
                        type="text"
                        value={goal}
                        onChange={e => handleEditGoalChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Goal ${index + 1}`}
                        required
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddEditGoal}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Another Goal
                  </button>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!!editPlan.isPublic}
                    onChange={e => setEditPlan(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="mr-2"
                    id="editIsPublic"
                  />
                  <label htmlFor="editIsPublic" className="text-sm text-gray-700">Make this plan public</label>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPlan; 