import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting to connect to:', 'http://localhost:8080/api/auth/login');
      
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Login successful, received data:', data);
      
      if (data.token) {
        // Call the onLogin prop with user data
        onLogin({
          token: data.token,
          username: username,
          // Add any other user data from the response
          ...data.userData
        });
        navigate('/profile');
      } else {
        throw new Error('No token received in response');
      }
    } catch (error) {
      console.error('Login error details:', error);
      if (error.message.includes('Failed to fetch')) {
        setError('Cannot connect to the server. Please check if the server is running and CORS is properly configured.');
      } else {
        setError(error.message || 'An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Sign in to your account
        </h2>
        
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Don't have an account? Sign up
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
