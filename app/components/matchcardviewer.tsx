// components/MatchCardViewer.tsx
import { useState } from 'react';
import { Match, Team } from '../types';

interface MatchCardViewerProps {
  match: Match;
  homeTeam: Team | undefined;
  awayTeam: Team | undefined;
}

export default function MatchCardViewer({ match, homeTeam, awayTeam }: MatchCardViewerProps) {
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
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Match Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[match.status]}`}>
            {match.status.toUpperCase()}
          </span>
          <span className="text-gray-400">
            {match.date} {match.time && `at ${match.time}`}
          </span>
        </div>
        
        {/* Teams and Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {homeTeam.logo && (
              <img src={homeTeam.logo} alt={homeTeam.name} className="w-12 h-12 object-contain" />
            )}
            <span className="font-medium text-lg">{homeTeam.name}</span>
          </div>
          
          <div className="text-center mx-4">
            <div className="text-3xl font-bold">
              {match.homeScore} - {match.awayScore}
            </div>
            {match.status === 'live' && (
              <div className="flex items-center justify-center mt-1 text-red-400">
                <span className="animate-pulse">●</span>
                <span className="ml-1 text-sm">LIVE</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 flex-1 justify-end">
            <span className="font-medium text-lg">{awayTeam.name}</span>
            {awayTeam.logo && (
              <img src={awayTeam.logo} alt={awayTeam.name} className="w-12 h-12 object-contain" />
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveSection('stream')}
          className={`flex-1 py-3 font-medium ${activeSection === 'stream' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
        >
          Live Stream
        </button>
        <button
          onClick={() => setActiveSection('lineup')}
          className={`flex-1 py-3 font-medium ${activeSection === 'lineup' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
        >
          Lineups
        </button>
        <button
          onClick={() => setActiveSection('blog')}
          className={`flex-1 py-3 font-medium ${activeSection === 'blog' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
        >
          Live Blog
        </button>
      </div>

      {/* Stream Section */}
      {activeSection === 'stream' && (
        <div className="p-6">
          <div className="aspect-video bg-black">
            <iframe
              src={extractSrcFromEmbed(match.streamEmbed)}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              title={`Stream for ${homeTeam.name} vs ${awayTeam.name}`}
            />
          </div>
        </div>
      )}

      {/* Lineup Section */}
      {activeSection === 'lineup' && (
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-400 mb-3">{homeTeam.name}</h4>
              <ul className="space-y-2">
                {match.lineups.home.map((player, i) => (
                  <li key={i} className="bg-gray-700 px-3 py-2 rounded">{player}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-400 mb-3">{awayTeam.name}</h4>
              <ul className="space-y-2">
                {match.lineups.away.map((player, i) => (
                  <li key={i} className="bg-gray-700 px-3 py-2 rounded">{player}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Blog Section */}
      {activeSection === 'blog' && (
        <div className="p-6">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {match.blogPosts.slice().reverse().map(post => (
              <div key={post.id} className="bg-gray-700 p-3 rounded">
                <span className="text-blue-400 text-sm">[{post.timestamp}]</span>
                <p className="mt-1">{post.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}