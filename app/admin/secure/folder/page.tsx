// app/admin/page.tsx
"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/adminlayout';
import { Team, Match } from '../../../types';
import { getTeams, getMatches } from '../../../lib/supabase-service';

export default function AdminPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [teamsData, matchesData] = await Promise.all([
          getTeams(),
          getMatches()
        ]);
        setTeams(teamsData || []);
        setMatches(matchesData || []);
      } catch (error) {
        console.error('Error loading data:', error);
        setTeams([]);
        setMatches([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Admin...</div>
      </div>
    );
  }

  return (
    <AdminLayout 
      teams={teams}
      matches={matches}
      setTeams={setTeams}
      setMatches={setMatches}
    />
  );
}