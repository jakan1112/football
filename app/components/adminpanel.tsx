// components/AdminPanel.tsx
"use client";
import { useState } from 'react';
import TeamForm from './teamform';
import MatchForm from './matchform';
import MatchListAdmin from './matchlistadmin';
import TeamListAdmin from './teamlistadmin';
import { Team, Match } from '../types';
import { addMatch, updateMatch, deleteMatch, addTeam, updateTeam, deleteTeam, getTeams, getMatches } from '../lib/supabase-service';
import AutoMatchGenerator from './AutoMatchGenerator';

type AdminTab = 'matches' | 'add-match' | 'teams' | 'add-team' |'auto-generate';

interface AdminPanelProps {
  teams?: Team[];
  matches?: Match[];
  setTeams: (teams: Team[]) => void;
  setMatches: (matches: Match[]) => void;
}
export default function AdminPanel({ teams = [], matches = [], setTeams, setMatches }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('matches');
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddTeam = async (teamData: Omit<Team, 'id'>) => {
    setIsLoading(true);
    try {
      if (editingTeam) {
        const updatedTeam = await updateTeam(editingTeam.id, teamData);
        if (updatedTeam) {
          const updatedTeams = await getTeams();
          setTeams(updatedTeams);
          setEditingTeam(null);
          setActiveTab('teams');
        }
      } else {
        const newTeam = await addTeam(teamData);
        if (newTeam) {
          const updatedTeams = await getTeams();
          setTeams(updatedTeams);
          setActiveTab('teams');
        }
      }
    } catch (error) {
      console.error('Error saving team:', error);
      alert('Error saving team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMatch = async (matchData: Omit<Match, 'id' | 'status' | 'homeScore' | 'awayScore' | 'lineups' | 'blogPosts'>) => {
    setIsLoading(true);
    try {
      const matchWithDefaults = {
        ...matchData,
        status: 'upcoming' as const,
        homeScore: 0,
        awayScore: 0,
        lineups: { home: [], away: [] },
        blogPosts: []
      };

      if (editingMatch) {
        const updatedMatch = await updateMatch(editingMatch.id, matchData);
        if (updatedMatch) {
          const updatedMatches = await getMatches();
          setMatches(updatedMatches);
          setEditingMatch(null);
          setActiveTab('matches');
        }
      } else {
        const newMatch = await addMatch(matchWithDefaults);
        if (newMatch) {
          const updatedMatches = await getMatches();
          setMatches(updatedMatches);
          setActiveTab('matches');
        }
      }
    } catch (error) {
      console.error('Error saving match:', error);
      alert('Error saving match. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
// SIMPLEST FIX: Create a wrapper function
type MatchFormData = {
  homeTeamId: number;
  awayTeamId: number;
  date: string;
  slug?: string;
  [key: string]: any; // Add other fields as needed
};

const handleMatchFormSubmit = async (formData: Omit<MatchFormData, 'homeTeamId' | 'awayTeamId'> & { homeTeamId: number; awayTeamId: number; }) => {
  // Convert to the format handleAddMatch expects
  const matchData = {
    ...formData,
    slug: formData.slug || '' // Provide default empty slug
  } as Omit<Match, 'id' | 'status' | 'homeScore' | 'awayScore' | 'lineups' | 'blogPosts'>;
  
  await handleAddMatch(matchData);
};

  const handleUpdateMatch = async (matchId: number, updates: Partial<Match>) => {
    setIsLoading(true);
    try {
      const updatedMatch = await updateMatch(matchId, updates);
      if (updatedMatch) {
        const updatedMatches = await getMatches();
        setMatches(updatedMatches);
      }
    } catch (error) {
      console.error('Error updating match:', error);
      alert('Error updating match. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMatch = async (matchId: number) => {
    if (!confirm('Are you sure you want to delete this match?')) return;
    
    setIsLoading(true);
    try {
      const success = await deleteMatch(matchId);
      if (success) {
        const updatedMatches = await getMatches();
        setMatches(updatedMatches);
      }
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('Error deleting match. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    const isTeamUsed = matches.some(match => 
      match.homeTeamId === teamId || match.awayTeamId === teamId
    );
    
    if (isTeamUsed) {
      alert('Cannot delete team because it is used in existing matches');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this team?')) return;
    
    setIsLoading(true);
    try {
      const success = await deleteTeam(teamId);
      if (success) {
        const updatedTeams = await getTeams();
        setTeams(updatedTeams);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Error deleting team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditingMatch = (match: Match) => {
    setEditingMatch(match);
    setActiveTab('add-match');
  };

  const startEditingTeam = (team: Team) => {
    setEditingTeam(team);
    setActiveTab('add-team');
  };

  const cancelEditing = () => {
    setEditingMatch(null);
    setEditingTeam(null);
  };

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    cancelEditing();
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 mb-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            
            <div className="text-sm text-gray-400">
              {matches.length} matches • {teams.length} teams
              {isLoading && <span className="ml-2 text-yellow-400">Saving...</span>}
            </div>
          </div>

          <div className="flex overflow-x-auto space-x-4 pb-2">
            <button 
              className={`py-3 px-4 font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'matches' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-white'
              }`}
              onClick={() => handleTabChange('matches')}
            >
              📋 Manage Matches
            </button>
            <button 
              className={`py-3 px-4 font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'add-match' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-white'
              }`}
              onClick={() => handleTabChange('add-match')}
            >
              ⚽ {editingMatch ? 'Edit Match' : 'Add Match'}
            </button>
            <button 
              className={`py-3 px-4 font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'teams' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-white'
              }`}
              onClick={() => handleTabChange('teams')}
            >
            👥 Manage Teams
            </button>
            <button 
              className={`py-3 px-4 font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'add-team' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-white'
              }`}
              onClick={() => handleTabChange('add-team')}
            >
              ➕ {editingTeam ? 'Edit Team' : 'Add Team'}
            </button>
            <button 
  className={`py-3 px-4 font-medium whitespace-nowrap border-b-2 transition-colors ${
    activeTab === 'auto-generate' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-white'
  }`}
  onClick={() => handleTabChange('auto-generate')}
>
  🤖 Auto Generate
</button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {activeTab === 'matches' && (
          <MatchListAdmin 
            matches={matches} 
            teams={teams}
            onUpdateMatch={handleUpdateMatch}
            onDeleteMatch={handleDeleteMatch}
            onEditMatch={startEditingMatch}
          />
        )}

        {activeTab === 'add-match' && (
          <div>
            {editingMatch && (
              <div className="mb-6 p-4 bg-yellow-600 rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="font-medium">
                    Editing Match: {teams.find(t => t.id === editingMatch.homeTeamId)?.name} vs {teams.find(t => t.id === editingMatch.awayTeamId)?.name}
                  </p>
                  <button 
                    onClick={cancelEditing}
                    className="bg-yellow-700 hover:bg-yellow-800 text-white px-3 py-1 rounded text-sm"
                  >
                    Cancel Edit
                  </button>
                </div>
              </div>
            )}
          <MatchForm 
  teams={teams} 
  onSubmit={handleMatchFormSubmit}
  editingMatch={editingMatch}
  isLoading={isLoading}
/>
          </div>
        )}

        {activeTab === 'teams' && (
          <TeamListAdmin 
            teams={teams}
            onEditTeam={startEditingTeam}
            onDeleteTeam={handleDeleteTeam}
          />
        )}

        {activeTab === 'add-team' && (
          <div>
            {editingTeam && (
              <div className="mb-6 p-4 bg-yellow-600 rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Editing Team: {editingTeam.name}</p>
                  <button 
                    onClick={cancelEditing}
                    className="bg-yellow-700 hover:bg-yellow-800 text-white px-3 py-1 rounded text-sm"
                  >
                    Cancel Edit
                  </button>
                </div>
              </div>
            )}
            <TeamForm 
              onSubmit={handleAddTeam}
              editingTeam={editingTeam}
              isLoading={isLoading}
            />
          </div>
        )}
        {activeTab === 'auto-generate' && (
  <AutoMatchGenerator onMatchesAdded={() => {
    // Refresh matches list
    getMatches().then(setMatches);
  }} />
)}
      </div>
    </div>
  );
}