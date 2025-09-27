// components/MatchListAdmin.tsx
import { useState } from 'react';
import MatchCardAdmin from './matchcardadmin';
import { Match, Team } from '../types';

interface MatchListAdminProps {
  matches: Match[];
  teams: Team[];
  onUpdateMatch: (matchId: number, updates: Partial<Match>) => void;
  onDeleteMatch: (matchId: number) => void;
  onEditMatch: (match: Match) => void;
}

type MatchFilter = 'all' | 'upcoming' | 'live' | 'finished';

export default function MatchListAdmin({ matches = [], teams = [], onUpdateMatch, onDeleteMatch, onEditMatch }: MatchListAdminProps) {
  const [filter, setFilter] = useState<MatchFilter>('all');

  // Safe filtering with default empty array
  const filteredMatches = (matches || []).filter(match => {
    if (filter === 'all') return true;
    return match.status === filter;
  });

  const getTeam = (id: number): Team | undefined => 
    (teams || []).find(team => team.id === id);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setFilter('all')}
          >
            All Matches
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium ${
              filter === 'upcoming' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium ${
              filter === 'live' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setFilter('live')}
          >
            Live
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              filter === 'finished' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setFilter('finished')}
          >
            Finished
          </button>
        </div>
        
        <div className="text-gray-400">
          {(matches || []).length} match{(matches || []).length !== 1 ? 'es' : ''} total
        </div>
      </div>

      <div className="space-y-6">
        {filteredMatches.length > 0 ? (
          filteredMatches.map(match => {
            const homeTeam = getTeam(match.homeTeamId);
            const awayTeam = getTeam(match.awayTeamId);
            
            // Only render if both teams exist
            if (!homeTeam || !awayTeam) return null;
            
            return (
              <MatchCardAdmin
                key={match.id}
                match={match}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                onUpdateMatch={onUpdateMatch}
                onDeleteMatch={onDeleteMatch}
                onEditMatch={onEditMatch}
              />
            );
          })
        ) : (
          <div className="text-center py-16 bg-gray-800 rounded-lg">
            <div className="text-gray-400 text-lg mb-2">
              {matches && matches.length > 0 
                ? `No ${filter} matches found` 
                : 'No matches created yet'
              }
            </div>
            <p className="text-gray-500">
              {matches && matches.length > 0 
                ? 'Try changing the filter or add new matches' 
                : 'Start by adding your first match'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}