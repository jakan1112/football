// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import AdminLayout from './components/adminlayout';
import ViewerPanel from './components/viewerpanel';
import { Team, Match } from './types';
import { getMatches, getTeams, testKVConnection } from './lib/data-service';

export default function Home() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageType, setStorageType] = useState<'kv' | 'local'>('local');

  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname === '/admin';

  // Load data and test connection
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        
        // Test KV connection first
        const isKVConnected = await testKVConnection();
        setStorageType(isKVConnected ? 'kv' : 'local');
        
        console.log(`Using storage: ${isKVConnected ? 'Vercel KV' : 'LocalStorage'}`);
        
        // Load data
        const [loadedMatches, loadedTeams] = await Promise.all([
          getMatches(),
          getTeams()
        ]);
        
        setMatches(loadedMatches);
        setTeams(loadedTeams);
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Save data when it changes
  useEffect(() => {
    if (matches.length > 0 || teams.length > 0) {
      const saveData = async () => {
        await Promise.all([
          saveMatches(matches),
          saveTeams(teams)
        ]);
      };
      saveData();
    }
  }, [matches, teams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Loading Football Data...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Storage Indicator */}
      <div className={`fixed top-4 right-4 px-3 py-1 rounded-full text-sm z-50 ${
        storageType === 'kv' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-black'
      }`}>
        {storageType === 'kv' ? '🟢 Cloud Sync' : '🟡 Local Storage'}
      </div>

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

// Import save functions (add these at the top)
import { saveMatches, saveTeams } from './lib/data-service';