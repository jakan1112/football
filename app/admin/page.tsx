// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../components/adminlayout';
import ViewerPanel from '../components/viewerpanel';
import { Team, Match } from '../types';

export default function Home() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is on admin route
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname === '/admin';

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTeams = localStorage.getItem('footballTeams');
    const savedMatches = localStorage.getItem('footballMatches');
    
    if (savedTeams) setTeams(JSON.parse(savedTeams));
    if (savedMatches) setMatches(JSON.parse(savedMatches));
    
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('footballTeams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('footballMatches', JSON.stringify(matches));
  }, [matches]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {isAdminRoute ? (
        <AdminLayout 
          teams={teams}
          matches={matches}
          setTeams={setTeams}
          setMatches={setMatches}
        />
      ) : (
        <ViewerPanel 
          teams={teams}
          matches={matches}
        />
      )}
    </div>
  );
}