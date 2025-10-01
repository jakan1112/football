// components/MatchDetailPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { Match, Team } from '../types';
import Link from 'next/link';
import { getTeams } from '../lib/supabase-service';

interface MatchDetailPageProps {
  match: Match;
}

export default function MatchDetailPage({ match }: MatchDetailPageProps) {
  const [activeSection, setActiveSection] = useState<'stream' | 'lineup' | 'blog'>('stream');
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  // Fetch teams like in MatchList component
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsData = await getTeams();
        setTeams(teamsData);
        
        // Find home and away teams
        const home = teamsData.find(team => team.id === match.homeTeamId);
        const away = teamsData.find(team => team.id === match.awayTeamId);
        
        setHomeTeam(home || null);
        setAwayTeam(away || null);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, [match.homeTeamId, match.awayTeamId]);

  if (!homeTeam || !awayTeam) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-xl text-center">Loading match data...</div>
      </div>
    );
  }

  const statusColors: Record<Match['status'], string> = {
    upcoming: 'bg-yellow-500',
    live: 'bg-red-500',
    finished: 'bg-green-500'
  };

  const extractSrcFromEmbed = (embed: string): string => {
    const srcMatch = embed.match(/src="([^"]*)"/);
    return srcMatch ? srcMatch[1] : '';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Mobile First Responsive Design */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* Back Button and Match Header - FIXED Responsive Layout */}
        <div className="flex flex-col space-y-3">
          <Link
            href="/"
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors w-fit text-sm sm:text-base"
          >
            ← Back to Matches
          </Link>
          
          <div className="flex flex-col space-y-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center break-words">
              {homeTeam.name} vs {awayTeam.name}
            </h1>
            <div className="flex flex-col xs:flex-row items-center justify-center gap-2">
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[match.status]} w-fit`}>
                {match.status.toUpperCase()}
              </span>
              <span className="text-gray-400 text-sm text-center">
                {match.league && `${match.league} • `}{match.date} at {match.time}
              </span>
            </div>
          </div>
        </div>

        {/* Match Header Card - FIXED Mobile Layout */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            {/* Home Team - Fixed Layout */}
            <div className="flex flex-col items-center flex-1 min-w-0">
              {homeTeam.logo && (
                <img 
                  src={homeTeam.logo} 
                  alt={homeTeam.name} 
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain mb-2" 
                />
              )}
              <span className="font-bold text-lg sm:text-xl text-center break-words w-full">
                {homeTeam.name}
              </span>
            </div>
            
            {/* Score Section - Fixed Centered Layout */}
            <div className="flex flex-col items-center mx-2 flex-shrink-0">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl min-w-[120px] text-center">
                {match.homeScore} - {match.awayScore}
              </div>
              {match.status === 'live' && (
                <div className="flex items-center justify-center mt-3 text-red-400">
                  <span className="animate-pulse text-sm">●</span>
                  <span className="ml-2 font-medium text-sm">LIVE</span>
                </div>
              )}
            </div>
            
            {/* Away Team - Fixed Layout */}
            <div className="flex flex-col items-center flex-1 min-w-0">
              {awayTeam.logo && (
                <img 
                  src={awayTeam.logo} 
                  alt={awayTeam.name} 
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain mb-2" 
                />
              )}
              <span className="font-bold text-lg sm:text-xl text-center break-words w-full">
                {awayTeam.name}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Responsive */}
        <div className="flex border-b border-gray-700 overflow-x-auto">
          <button
            onClick={() => setActiveSection('stream')}
            className={`flex-1 min-w-[100px] py-3 sm:py-4 font-medium text-sm sm:text-base ${
              activeSection === 'stream' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-white'
            } transition-colors`}
          >
            📺 Stream
          </button>
          <button
            onClick={() => setActiveSection('lineup')}
            className={`flex-1 min-w-[100px] py-3 sm:py-4 font-medium text-sm sm:text-base ${
              activeSection === 'lineup' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-white'
            } transition-colors`}
          >
            👥 Lineups
          </button>
          <button
            onClick={() => setActiveSection('blog')}
            className={`flex-1 min-w-[100px] py-3 sm:py-4 font-medium text-sm sm:text-base ${
              activeSection === 'blog' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-white'
            } transition-colors`}
          >
            📝 Blog
          </button>
        </div>

        {/* Stream Section */}
        {activeSection === 'stream' && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="aspect-video bg-black">
              <iframe
                src={extractSrcFromEmbed(match.streamEmbed)}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                title={`Stream for ${homeTeam.name} vs ${awayTeam.name}`}
              />
            </div>
            <div className="p-3 sm:p-4 bg-gray-750">
              <p className="text-gray-400 text-xs sm:text-sm text-center">
                Stream provided by external source. Quality and availability may vary.
              </p>
            </div>
          </div>
        )}

        {/* Lineup Section - Responsive */}
        {activeSection === 'lineup' && (
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <h3 className="font-bold text-lg sm:text-xl text-blue-400 mb-3 sm:mb-4 flex items-center justify-center md:justify-start">
                  {homeTeam.logo && (
                    <img 
                      src={homeTeam.logo} 
                      alt={homeTeam.name} 
                      className="w-6 h-6 sm:w-8 sm:h-8 object-contain mr-2 sm:mr-3" 
                    />
                  )}
                  <span className="truncate">{homeTeam.name}</span>
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {match.lineups?.home?.length > 0 ? (
                    match.lineups.home.map((player, i) => (
                      <div key={i} className="bg-gray-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center">
                        <span className="w-6 text-gray-400 text-xs sm:text-sm">{i + 1}.</span>
                        <span className="text-sm sm:text-base truncate">{player}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">
                      Lineup information not available
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-lg sm:text-xl text-blue-400 mb-3 sm:mb-4 flex items-center justify-center md:justify-start">
                  {awayTeam.logo && (
                    <img 
                      src={awayTeam.logo} 
                      alt={awayTeam.name} 
                      className="w-6 h-6 sm:w-8 sm:h-8 object-contain mr-2 sm:mr-3" 
                    />
                  )}
                  <span className="truncate">{awayTeam.name}</span>
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {match.lineups?.away?.length > 0 ? (
                    match.lineups.away.map((player, i) => (
                      <div key={i} className="bg-gray-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center">
                        <span className="w-6 text-gray-400 text-xs sm:text-sm">{i + 1}.</span>
                        <span className="text-sm sm:text-base truncate">{player}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">
                      Lineup information not available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Section - Responsive */}
        {activeSection === 'blog' && (
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4">Live Match Updates</h3>
            <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
              {match.blogPosts?.length > 0 ? (
                match.blogPosts.slice().reverse().map(post => (
                  <div key={post.id} className="bg-gray-700 p-3 sm:p-4 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                      <span className="text-blue-400 font-medium text-sm sm:text-base">[{post.timestamp}]</span>
                      {post.type === 'goal' && (
                        <span className="bg-green-600 text-white px-2 py-1 rounded text-xs sm:text-sm w-fit">GOAL ⚽</span>
                      )}
                    </div>
                    <p className="text-white text-sm sm:text-base">{post.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">
                  No live updates yet. Check back during the match!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}