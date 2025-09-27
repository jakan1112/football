// components/MatchCard.tsx
"use client";
import { useState } from 'react';
import { Match, Team } from '../types';

interface MatchCardProps {
  match: Match;
  homeTeam: Team | undefined;
  awayTeam: Team | undefined;
  updateMatchStatus: (matchId: number, status: Match['status']) => void;
  updateScore: (matchId: number, team: 'home' | 'away', action: 'increment' | 'decrement') => void;
}

export default function MatchCard({ match, homeTeam, awayTeam, updateMatchStatus, updateScore }: MatchCardProps) {
  const [showLineup, setShowLineup] = useState<boolean>(false);
  const [showStream, setShowStream] = useState<boolean>(false);

  if (!homeTeam || !awayTeam) return null;

  const statusColors: Record<Match['status'], string> = {
    upcoming: 'bg-yellow-500',
    live: 'bg-red-500',
    finished: 'bg-green-500'
  };

  // Function to extract src from embed code
  const extractSrcFromEmbed = (embed: string): string => {
    const srcMatch = embed.match(/src="([^"]*)"/);
    return srcMatch ? srcMatch[1] : '';
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Match Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[match.status]}`}>
            {match.status.toUpperCase()}
          </span>
          <span className="text-gray-400 text-sm">
            {match.date} {match.time && `at ${match.time}`}
          </span>
        </div>
        
        {/* Teams and Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {homeTeam.logo && (
              <img 
                src={homeTeam.logo} 
                alt={homeTeam.name} 
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/team-placeholder.png';
                }}
              />
            )}
            <span className="font-medium">{homeTeam.name}</span>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold">
              {match.homeScore} - {match.awayScore}
            </div>
            {match.status === 'live' && (
              <div className="flex space-x-2 mt-1">
                <button 
                  onClick={() => updateScore(match.id, 'home', 'increment')}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                >
                  +1 Home
                </button>
                <button 
                  onClick={() => updateScore(match.id, 'away', 'increment')}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                >
                  +1 Away
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="font-medium">{awayTeam.name}</span>
            {awayTeam.logo && (
              <img 
                src={awayTeam.logo} 
                alt={awayTeam.name} 
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/team-placeholder.png';
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Match Actions */}
      <div className="p-4 bg-gray-750 flex justify-between">
        <button
          onClick={() => setShowLineup(!showLineup)}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          {showLineup ? 'Hide' : 'Show'} Lineup
        </button>
        
        {match.streamEmbed && (
          <button
            onClick={() => setShowStream(!showStream)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {showStream ? 'Hide' : 'Show'} Stream
          </button>
        )}
        
        <div className="flex space-x-2">
          {match.status !== 'live' && (
            <button
              onClick={() => updateMatchStatus(match.id, 'live')}
              className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
            >
              Go Live
            </button>
          )}
          {match.status === 'live' && (
            <button
              onClick={() => updateMatchStatus(match.id, 'finished')}
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
            >
              End Match
            </button>
          )}
        </div>
      </div>

      {/* Lineup Section */}
      {showLineup && (
        <div className="p-4 border-t border-gray-700">
          <h4 className="font-medium mb-2">Lineups</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-blue-400">{homeTeam.name}</h5>
              <ul className="mt-1 space-y-1">
                {match.lineups.home.length > 0 ? (
                  match.lineups.home.map((player, i) => (
                    <li key={i}>{player}</li>
                  ))
                ) : (
                  <li className="text-gray-500">No lineup data</li>
                )}
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-blue-400">{awayTeam.name}</h5>
              <ul className="mt-1 space-y-1">
                {match.lineups.away.length > 0 ? (
                  match.lineups.away.map((player, i) => (
                    <li key={i}>{player}</li>
                  ))
                ) : (
                  <li className="text-gray-500">No lineup data</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Stream Section */}
      {showStream && match.streamEmbed && (
        <div className="p-4 border-t border-gray-700">
          <div className="aspect-video bg-black">
            <iframe
              src={extractSrcFromEmbed(match.streamEmbed)}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              title={`Stream for ${homeTeam.name} vs ${awayTeam.name}`}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Stream provided by external source. Quality and availability may vary.
          </p>
        </div>
      )}
    </div>
  );
}