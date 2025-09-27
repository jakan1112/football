// components/AdminPanel.tsx
import { useState } from 'react';
import TeamForm from './teamform';
import MatchForm from './matchform';
import MatchListAdmin from './matchlistadmin';
import TeamListAdmin from './teamlistadmin';
import { Team, Match } from '../types';

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

  const addTeam = (teamData: Omit<Team, 'id'>) => {
    if (editingTeam) {
      // Update existing team
      setTeams(teams.map(team => 
        team.id === editingTeam.id ? { ...team, ...teamData } : team
      ));
      setEditingTeam(null);
      setActiveTab('teams');
    } else {
      // Add new team
      const newTeam: Team = {
        id: Date.now(),
        ...teamData
      };
      setTeams([...teams, newTeam]);
      setActiveTab('teams');
    }
  };

  const addMatch = (matchData: Omit<Match, 'id' | 'status' | 'homeScore' | 'awayScore' | 'lineups' | 'blogPosts'>) => {
    if (editingMatch) {
      // Update existing match
      setMatches(matches.map(match => 
        match.id === editingMatch.id ? { ...match, ...matchData } : match
      ));
      setEditingMatch(null);
      setActiveTab('matches');
    } else {
      // Add new match
      const newMatch: Match = {
        id: Date.now(),
        ...matchData,
        status: 'upcoming',
        homeScore: 0,
        awayScore: 0,
        lineups: {
          home: [],
          away: []
        },
        blogPosts: []
      };
      setMatches([...matches, newMatch]);
      setActiveTab('matches');
    }
  };

  const updateMatch = (matchId: number, updates: Partial<Match>) => {
    setMatches(matches.map(match => 
      match.id === matchId ? { ...match, ...updates } : match
    ));
  };

  const deleteMatch = (matchId: number) => {
    setMatches(matches.filter(match => match.id !== matchId));
  };

  const deleteTeam = (teamId: number) => {
    const isTeamUsed = matches.some(match => 
      match.homeTeamId === teamId || match.awayTeamId === teamId
    );
    
    if (isTeamUsed) {
      alert('Cannot delete team because it is used in existing matches');
      return;
    }
    
    setTeams(teams.filter(team => team.id !== teamId));
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

  // Separate function to handle tab changes without canceling edits
  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
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
            onUpdateMatch={updateMatch}
            onDeleteMatch={deleteMatch}
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
              onSubmit={addMatch}
              editingMatch={editingMatch}
            />
          </div>
        )}

        {activeTab === 'teams' && (
          <TeamListAdmin 
            teams={teams}
            onEditTeam={startEditingTeam}
            onDeleteTeam={deleteTeam}
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
              onSubmit={addTeam}
              editingTeam={editingTeam}
            />
          </div>
        )}
      </div>
    </div>
  );
}