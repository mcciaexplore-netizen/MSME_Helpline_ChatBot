import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for constants.
import { TEAM_MEMBERS } from '../constants';
import { TeamMember } from '../types';

interface UserLoginProps {
  onLogin: (userId: string, password?: string) => boolean;
}

const UserLogin: React.FC<UserLoginProps> = ({ onLogin }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(TEAM_MEMBERS[0]?.id || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const selectedUser = useMemo(() => {
    return TEAM_MEMBERS.find(m => m.id === selectedUserId);
  }, [selectedUserId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
        setError('Please select a valid user.');
        return;
    }

    if (onLogin(selectedUserId, password)) {
        setError('');
    } else {
        setError('Invalid password. Please try again.');
    }
  };
  
  const isGuest = selectedUser?.role === 'guest';

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-xl">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
            Welcome
            </h2>
            <p className="mt-2 text-sm text-gray-600">
                Please select your name to continue.
            </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="user-select"
              className="block text-sm font-medium text-gray-700"
            >
              Select User
            </label>
            <select
              id="user-select"
              name="user"
              required
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                setPassword(''); // Reset password on user change
                setError(''); // Clear error on user change
              }}
              className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {TEAM_MEMBERS.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {!isGuest && (
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
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          )}
          
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isGuest ? 'Continue as Guest' : 'Login'}
            </button>
          </div>
        </form>
         <p className="mt-4 text-xs text-center text-gray-500">
          This login is for demonstration purposes to associate queries with a user.
        </p>
      </div>
    </div>
  );
};

export default UserLogin;