// app/page.tsx - FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import AdminLayout from './components/adminlayout';
import ViewerPanel from './components/viewerpanel';
import { Team, Match } from './types';
import { getTeams, getMatches } from './lib/supabase-service';
import { supabase } from './lib/supabase'; // ADD THIS IMPORT
import NativeBannerAd from './components/ads/NativeBannerAd';
import InPagePushAd from './components/ads/InPagePushAd';
import PounderAd from './components/ads/PounderAd';

export default function Home() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname === '/admin';

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load data
        const [loadedTeams, loadedMatches] = await Promise.all([
          getTeams(),
          getMatches()
        ]);
        
        setTeams(loadedTeams);
        setMatches(loadedMatches);
        
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();

    // Set up real-time subscriptions
    const teamsSubscription = supabase
      .channel('teams-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => {
        getTeams().then(setTeams);
      })
      .subscribe();

    const matchesSubscription = supabase
      .channel('matches-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
        getMatches().then(setMatches);
      })
      .subscribe();

    return () => {
      teamsSubscription.unsubscribe();
      matchesSubscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Loading Football Streams...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-xl mb-4">Loading Error</div>
          <div className="text-gray-300 mb-6">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-medium"
          >
            Refresh Page
          </button>
        </div>
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