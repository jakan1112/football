// components/AdminLayout.tsx
'use client';

import { useState, useEffect } from 'react';
import AdminLogin from './adminlogin';
import AdminPanel from './adminpanel';
import { Team, Match } from '../types';
import { getAdminSession, verifyAdminToken, clearAdminSession } from '../lib/auth-service';

interface AdminLayoutProps {
  teams: Team[];
  matches: Match[];
  setTeams: (teams: Team[]) => void;
  setMatches: (matches: Match[]) => void;
}

export default function AdminLayout({ teams, matches, setTeams, setMatches }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = getAdminSession();
      if (token && verifyAdminToken(token)) {
        setIsAuthenticated(true);
      } else {
        clearAdminSession();
      }
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    clearAdminSession();
    setIsAuthenticated(false);
    // Redirect to home page or login page
    window.location.href = '/';
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Checking Authentication...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Admin Header with Logout */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Free Football Live Stream - Admin</h1>
              <p className="text-gray-400">Secure Admin Panel</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-green-400">🔐 Authenticated</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
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