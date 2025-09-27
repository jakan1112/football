// components/MatchList.tsx
"use client";
import { useState } from 'react';
import MatchCard from './matchcard';
import { Match, Team } from '../types';

interface MatchListProps {
  matches: Match[];
  teams: Team[];
  updateMatchStatus: (matchId: number, status: Match['status']) => void;
  updateScore: (matchId: number, team: 'home' | 'away', action: 'increment' | 'decrement') => void;
}

type MatchFilter = 'all' | 'upcoming' | 'live' | 'finished';

export default function MatchList({ matches, teams, updateMatchStatus, updateScore }: MatchListProps) {
  const [filter, setFilter] = useState<MatchFilter>('all');

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    return match.status === filter;
  });

  const getTeam = (id: number): Team | undefined => teams.find(team => team.id === id);

  return (
    <div>
      <div className="flex justify-center mb-6">
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
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMatches.length > 0 ? (
          filteredMatches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              homeTeam={getTeam(match.homeTeamId)}
              awayTeam={getTeam(match.awayTeamId)}
              updateMatchStatus={updateMatchStatus}
              updateScore={updateScore}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-400">
            No matches found. Add some matches to get started!
          </div>
        )}
      </div>
    </div>
  );
}