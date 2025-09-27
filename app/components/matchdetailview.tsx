// components/MatchDetailView.tsx
import { useState } from 'react';
import { Match, Team } from '../types';

interface MatchDetailViewProps {
  match: Match;
  homeTeam: Team | undefined;
  awayTeam: Team | undefined;
  onBack: () => void;
}

export default function MatchDetailView({ match, homeTeam, awayTeam, onBack }: MatchDetailViewProps) {
  const [activeSection, setActiveSection] = useState<'stream' | 'lineup' | 'blog'>('stream');

  if (!homeTeam || !awayTeam) return null;

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
    <div className="space-y-6">
      {/* Back Button and Match Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          ← Back to Matches
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {homeTeam.name} vs {awayTeam.name}
          </h1>
          <div className="flex items-center space-x-4 mt-1">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[match.status]}`}>
              {match.status.toUpperCase()}
            </span>
            <span className="text-gray-400">
              {match.league && `${match.league} • `}{match.date} at {match.time}
            </span>
          </div>
        </div>
      </div>

      {/* Match Header Card */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {homeTeam.logo && (
              <img src={homeTeam.logo} alt={homeTeam.name} className="w-16 h-16 object-contain" />
            )}
            <span className="font-bold text-xl">{homeTeam.name}</span>
          </div>
          
          <div className="text-center mx-6">
            <div className="text-4xl font-bold bg-gray-700 px-8 py-3 rounded">
              {match.homeScore} - {match.awayScore}
            </div>
            {match.status === 'live' && (
              <div className="flex items-center justify-center mt-2 text-red-400">
                <span className="animate-pulse">●</span>
                <span className="ml-2 font-medium">LIVE</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 flex-1 justify-end">
            <span className="font-bold text-xl">{awayTeam.name}</span>
            {awayTeam.logo && (
              <img src={awayTeam.logo} alt={awayTeam.name} className="w-16 h-16 object-contain" />
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveSection('stream')}
          className={`flex-1 py-4 font-medium text-lg ${
            activeSection === 'stream' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
          }`}
        >
          📺 Live Stream
        </button>
        <button
          onClick={() => setActiveSection('lineup')}
          className={`flex-1 py-4 font-medium text-lg ${
            activeSection === 'lineup' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
          }`}
        >
          👥 Lineups
        </button>
        <button
          onClick={() => setActiveSection('blog')}
          className={`flex-1 py-4 font-medium text-lg ${
            activeSection === 'blog' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
          }`}
        >
          📝 Live Blog
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
          <div className="p-4 bg-gray-750">
            <p className="text-gray-400 text-sm text-center">
              Stream provided by external source. Quality and availability may vary.
            </p>
          </div>
        </div>
      )}

      {/* Lineup Section */}
      {activeSection === 'lineup' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-xl text-blue-400 mb-4 flex items-center">
                {homeTeam.logo && (
                  <img src={homeTeam.logo} alt={homeTeam.name} className="w-8 h-8 object-contain mr-3" />
                )}
                {homeTeam.name}
              </h3>
              <div className="space-y-3">
                {match.lineups.home.length > 0 ? (
                  match.lineups.home.map((player, i) => (
                    <div key={i} className="bg-gray-700 px-4 py-3 rounded-lg flex items-center">
                      <span className="w-6 text-gray-400 text-sm">{i + 1}.</span>
                      <span>{player}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    Lineup information not available
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-xl text-blue-400 mb-4 flex items-center">
                {awayTeam.logo && (
                  <img src={awayTeam.logo} alt={awayTeam.name} className="w-8 h-8 object-contain mr-3" />
                )}
                {awayTeam.name}
              </h3>
              <div className="space-y-3">
                {match.lineups.away.length > 0 ? (
                  match.lineups.away.map((player, i) => (
                    <div key={i} className="bg-gray-700 px-4 py-3 rounded-lg flex items-center">
                      <span className="w-6 text-gray-400 text-sm">{i + 1}.</span>
                      <span>{player}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    Lineup information not available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Section */}
      {activeSection === 'blog' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="font-bold text-xl mb-4">Live Match Updates</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {match.blogPosts.length > 0 ? (
              match.blogPosts.slice().reverse().map(post => (
                <div key={post.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-400 font-medium">[{post.timestamp}]</span>
                    {post.type === 'goal' && (
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">GOAL ⚽</span>
                    )}
                  </div>
                  <p className="text-white">{post.content}</p>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-8">
                No live updates yet. Check back during the match!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}