// components/AdminPanel.tsx
import { useState } from 'react';
import TeamForm from './teamform';
import MatchForm from './matchform';
import MatchListAdmin from './matchlistadmin';
import TeamListAdmin from './teamlistadmin';
import { Team, Match } from '../types';
import { addMatch, updateMatch, deleteMatch, addTeam, updateTeam, deleteTeam } from '../lib/data-service';

interface AdminPanelProps {
  teams: Team[];
  matches: Match[];
  setTeams: (teams: Team[]) => void;
  setMatches: (matches: Match[]) => void;
}

type AdminTab = 'matches' | 'add-match' | 'teams' | 'add-team';

export default function AdminPanel({ teams, matches, setTeams, setMatches }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('matches');
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const handleAddTeam = async (teamData: Omit<Team, 'id'>) => {
    const success = await addTeam(teamData);
    if (success) {
      // Refresh teams list
      const updatedTeams = await getTeams();
      setTeams(updatedTeams);
      
      if (editingTeam) {
        setEditingTeam(null);
        setActiveTab('teams');
      }
    }
  };

  const handleAddMatch = async (matchData: Omit<Match, 'id' | 'status' | 'homeScore' | 'awayScore' | 'lineups' | 'blogPosts'>) => {
    const success = await addMatch(matchData);
    if (success) {
      // Refresh matches list
      const updatedMatches = await getMatches();
      setMatches(updatedMatches);
      
      if (editingMatch) {
        setEditingMatch(null);
        setActiveTab('matches');
      }
    }
  };

  const handleUpdateMatch = async (matchId: number, updates: Partial<Match>) => {
    const success = await updateMatch(matchId, updates);
    if (success) {
      // Refresh matches list
      const updatedMatches = await getMatches();
      setMatches(updatedMatches);
    }
  };

  const handleDeleteMatch = async (matchId: number) => {
    const success = await deleteMatch(matchId);
    if (success) {
      // Refresh matches list
      const updatedMatches = await getMatches();
      setMatches(updatedMatches);
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    // Check if team is used in any matches
    const isTeamUsed = matches.some(match => 
      match.homeTeamId === teamId || match.awayTeamId === teamId
    );
    
    if (isTeamUsed) {
      alert('Cannot delete team because it is used in existing matches');
      return;
    }
    
    const success = await deleteTeam(teamId);
    if (success) {
      // Refresh teams list
      const updatedTeams = await getTeams();
      setTeams(updatedTeams);
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

  // Import get functions inside the component
  const getTeams = async () => {
    const { getTeams } = await import('../lib/data-service');
    return await getTeams();
  };

  const getMatches = async () => {
    const { getMatches } = await import('../lib/data-service');
    return await getMatches();
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 mb-6">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto space-x-4">
            <button 
              className={`py-4 px-4 font-medium whitespace-nowrap border-b-2 ${
                activeTab === 'matches' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400'
              }`}
              onClick={() => handleTabChange('matches')}
            >
              Manage Matches
            </button>
            <button 
              className={`py-4 px-4 font-medium whitespace-nowrap border-b-2 ${
                activeTab === 'add-match' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400'
              }`}
              onClick={() => handleTabChange('add-match')}
            >
              {editingMatch ? 'Edit Match' : 'Add Match'}
            </button>
            <button 
              className={`py-4 px-4 font-medium whitespace-nowrap border-b-2 ${
                activeTab === 'teams' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400'
              }`}
              onClick={() => handleTabChange('teams')}
            >
              Manage Teams
            </button>
            <button 
              className={`py-4 px-4 font-medium whitespace-nowrap border-b-2 ${
                activeTab === 'add-team' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400'
              }`}
              onClick={() => handleTabChange('add-team')}
            >
              {editingTeam ? 'Edit Team' : 'Add Team'}
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
              <div className="mb-4 p-4 bg-yellow-600 rounded-lg">
                <p className="font-medium">Editing Match: {teams.find(t => t.id === editingMatch.homeTeamId)?.name} vs {teams.find(t => t.id === editingMatch.awayTeamId)?.name}</p>
                <button 
                  onClick={cancelEditing}
                  className="text-sm underline mt-1"
                >
                  Cancel Edit
                </button>
              </div>
            )}
            <MatchForm 
              teams={teams} 
              onSubmit={handleAddMatch}
              editingMatch={editingMatch}
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
              <div className="mb-4 p-4 bg-yellow-600 rounded-lg">
                <p className="font-medium">Editing Team: {editingTeam.name}</p>
                <button 
                  onClick={cancelEditing}
                  className="text-sm underline mt-1"
                >
                  Cancel Edit
                </button>
              </div>
            )}
            <TeamForm 
              onSubmit={handleAddTeam}
              editingTeam={editingTeam}
            />
          </div>
        )}
      </div>
    </div>
  );
}