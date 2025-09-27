// components/AdminLayout.tsx
'use client';

import { useState, useEffect } from 'react';
import AdminLogin from './adminlogin';
import AdminPanel from './adminpanel';
import { Team, Match } from '../types';
import { saveMatches, saveTeams } from '../lib/data-service';

interface AdminLayoutProps {
  teams: Team[];
  matches: Match[];
  setTeams: (teams: Team[]) => void;
  setMatches: (matches: Match[]) => void;
}

const ADMIN_PASSWORD = 'admin123';

export default function AdminLayout({ teams, matches, setTeams, setMatches }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Check if user is already authenticated
  useEffect(() => {
    const savedAuth = localStorage.getItem('adminAuthenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  // Auto-save to KV when data changes
  useEffect(() => {
    if (isAuthenticated && (teams.length > 0 || matches.length > 0)) {
      const autoSave = async () => {
        setSaveStatus('saving');
        try {
          await Promise.all([
            saveMatches(matches),
            saveTeams(teams)
          ]);
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
          console.error('Error auto-saving:', error);
          setSaveStatus('error');
        }
      };
      
      autoSave();
    }
  }, [matches, teams, isAuthenticated]);

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
        <div className="text-white text-xl">Loading Admin...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div>
      {/* Admin Header with Status */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-gray-400">Manage matches and streams</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${
                  saveStatus === 'saving' ? 'bg-yellow-500 animate-pulse' :
                  saveStatus === 'saved' ? 'bg-green-500' :
                  saveStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
                }`}></div>
                <span className="text-xs text-gray-400">
                  {saveStatus === 'saving' ? 'Saving...' :
                   saveStatus === 'saved' ? 'Saved to cloud' :
                   saveStatus === 'error' ? 'Save failed' : 'All changes saved'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                {matches.length} matches • {teams.length} teams
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