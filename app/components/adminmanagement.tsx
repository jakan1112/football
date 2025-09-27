// components/AdminManagement.tsx (for managing admin users)
'use client';

import { useState } from 'react';
import { createAdminUser, verifyAdminCredentials } from '../lib/auth-service';

export default function AdminManagement() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const success = await createAdminUser(email, password);
      if (success) {
        setMessage('Admin user created successfully!');
        setEmail('');
        setPassword('');
      } else {
        setMessage('Failed to create admin user');
      }
    } catch (error) {
      setMessage('Error creating admin user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Create New Admin</h2>
      <form onSubmit={handleCreateAdmin} className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 rounded"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
        >
          {isLoading ? 'Creating...' : 'Create Admin'}
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}