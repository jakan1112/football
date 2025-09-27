// components/AdminLayout.tsx
'use client';

import { useState, useEffect } from 'react';
import AdminLogin from './adminlogin';
import AdminPanel from './adminpanel';
import { Team, Match } from '../types';

interface AdminLayoutProps {
  teams: Team[];
  matches: Match[];
  setTeams: (teams: Team[]) => void;
  setMatches: (matches: Match[]) => void;
}

// Simple password validation (you can make this more secure)
const ADMIN_PASSWORD = 'admin123'; // Change this to your desired password

export default function AdminLayout({ teams, matches, setTeams, setMatches }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if user is already authenticated (on mount)
  useEffect(() => {
    const savedAuth = localStorage.getItem('adminAuthenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  const handleLogin = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div>
      {/* Admin Header with Logout */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-gray-400">Manage matches and streams</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <AdminPanel 
        teams={teams}
        matches={matches}
        setTeams={setTeams}
        setMatches={setMatches}
      />
    </div>
  );
}