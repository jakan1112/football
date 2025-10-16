// components/MatchListView.tsx
import { useState } from 'react';
import { Match, Team } from '../types';
import Link from 'next/link';

import NativeBannerAd from './ads/NativeBannerAd';
import InPagePushAd from './ads/InPagePushAd';
import PounderAd from './ads/PounderAd';

interface MatchListViewProps {
  matches: Match[];
  teams: Team[];
  onMatchSelect: (matchId: number) => void;
}

type TimeFilter = 'all' | 'live' | 'today' | 'upcoming';

export default function MatchListView({ matches, teams, onMatchSelect }: MatchListViewProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('live');
  const [leagueFilter, setLeagueFilter] = useState<string>('all');

  // Get unique leagues
  const leagues = Array.from(new Set(matches.map(match => match.league || 'Other')));

  // Filter matches based on selected filters
  const filteredMatches = matches.filter(match => {
    // Time filter
    if (timeFilter === 'live' && match.status !== 'live') return false;
    if (timeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      if (match.date !== today) return false;
    }
    if (timeFilter === 'upcoming' && match.status !== 'upcoming') return false;
    
    // League filter
    if (leagueFilter !== 'all' && match.league !== leagueFilter) return false;
    
    return true;
  });

  // Group by date
  const matchesByDate = filteredMatches.reduce((acc, match) => {
    if (!acc[match.date]) {
      acc[match.date] = [];
    }
    acc[match.date].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  const getTeam = (id: number): Team | undefined => teams.find(team => team.id === id);

  const getMatchStatusText = (match: Match): string => {
    if (match.status === 'live') return 'Live Now';
    if (match.status === 'finished') return 'Finished';
    
    const matchTime = match.time;
    if (matchTime) {
      return `⏰ ${matchTime}`;
    }
    return 'Not Started';
  };

  const getStatusColor = (match: Match): string => {
    if (match.status === 'live') return 'text-red-500';
    if (match.status === 'finished') return 'text-green-500';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <InPagePushAd/>
      <PounderAd/>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6">
          
        <h1 className="text-2xl font-bold text-white mb-2">Free Football Live Stream</h1>
         <p className="text-gray-300">Watch live football matches for free</p>
          </div>

          {/* Time Filters */}
          <div className="flex overflow-x-auto pb-2 space-x-2 mb-4">
            <button
              onClick={() => setTimeFilter('live')}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                timeFilter === 'live' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              🔴 Live Matches
            </button>
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                timeFilter === 'today' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              📅 Today's Matches
            </button>
            <button
              onClick={() => setTimeFilter('upcoming')}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                timeFilter === 'upcoming' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              ⏳ Upcoming Matches
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                timeFilter === 'all' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              📋 All Matches
            </button>
          </div>

          {/* League Filter */}
          <div className="flex overflow-x-auto pb-2 space-x-2">
            <button
              onClick={() => setLeagueFilter('all')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                leagueFilter === 'all' 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              All Leagues
            </button>
            {leagues.map(league => (
              <button
                key={league}
                onClick={() => setLeagueFilter(league)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  leagueFilter === league 
                    ? 'bg-gray-600 text-white' 
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {league}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="container mx-auto px-4 py-6">
        
        {Object.keys(matchesByDate).length === 0 ? (
          <div className="text-center py-16">
            <NativeBannerAd />
            <div className="text-gray-400 text-lg">No matches found</div>
            <p className="text-gray-500 mt-2">No matches match the selected filters</p>
          </div>
        ) : (
          <div className="space-y-6">
            <NativeBannerAd />
            {Object.entries(matchesByDate).map(([date, dateMatches]) => (
              <div key={date} className="bg-gray-800 rounded-lg overflow-hidden">
                {/* Date Header */}
                <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
                  <h3 className="font-bold text-lg">
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                </div>

                {/* Matches List */}
                <div className="divide-y divide-gray-700"><NativeBannerAd />
                  {dateMatches.map(match => {
                    const homeTeam = getTeam(match.homeTeamId);
                    const awayTeam = getTeam(match.awayTeamId);
                    
                    if (!homeTeam || !awayTeam) return null;

                    return (
                      <div
                        key={match.id}
                        onClick={() =><Link href={`/match/${match.slug}`} className="block">
  
  Watch Match
</Link>}
                        className="p-4 hover:bg-gray-750 cursor-pointer transition-colors"
                      >
                        <Link href={`/match/${match.slug}`} className="block">


                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${getStatusColor(match)}`}>
                            {getMatchStatusText(match)}
                          </span>
                          <span className="text-gray-400 text-xs bg-gray-700 px-2 py-1 rounded">
                            {match.league}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Home Team */}
                          <div className="flex items-center space-x-3 flex-1">
                            {homeTeam.logo && (
                              <img 
                                src={homeTeam.logo} 
                                alt={homeTeam.name} 
                                className="w-10 h-10 object-contain rounded-full bg-gray-700 p-1"
                              />
                            )}
                            <span className="font-medium text-sm">{homeTeam.name}</span>
                          </div>

                          {/* Score */}
                          <div className="mx-4">
                            <div className="bg-gray-700 px-4 py-2 rounded-lg min-w-[80px] text-center">
                              <span className="text-xl font-bold">
                                {match.homeScore} - {match.awayScore}
                              </span>
                            </div>
                          </div>

                          {/* Away Team */}
                          <div className="flex items-center space-x-3 flex-1 justify-end">
                            <span className="font-medium text-sm">{awayTeam.name}</span>
                            {awayTeam.logo && (
                              <img 
                                src={awayTeam.logo} 
                                alt={awayTeam.name} 
                                className="w-10 h-10 object-contain rounded-full bg-gray-700 p-1"
                              />
                            )}
                          </div>
                        </div>

                        {/* Watch Button */}
                        <div className="flex justify-center mt-3">
                          
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors">
                            {match.status === 'live' ? '🔴 Watch Live' : 'Watch Match'}
                          </button>
                        </div>
                      </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}