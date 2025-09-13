import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: (password: string) => boolean; // Returns true on success, false on failure
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(password)) {
      // Success, parent will handle view change
      setError('');
    } else {
      setError('Invalid password. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full p-4 bg-slate-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Admin Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
              placeholder="Enter admin password"
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Login
            </button>
          </div>
        </form>
        <div className="text-center">
            <button
                onClick={onCancel}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
                Back to User Login
            </button>
        </div>
         <p className="mt-4 text-xs text-center text-gray-500">
          Note: This is a basic password protection for demonstration. For production, use a secure backend authentication system.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
