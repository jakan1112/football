// components/MatchCardAdmin.tsx
import { useState } from 'react';
import { Match, Team, BlogPost } from '../types';

interface MatchCardAdminProps {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  onUpdateMatch: (matchId: number, updates: Partial<Match>) => void;
  onDeleteMatch: (matchId: number) => void;
  onEditMatch: (match: Match) => void;
}

export default function MatchCardAdmin({ match, homeTeam, awayTeam, onUpdateMatch, onDeleteMatch, onEditMatch }: MatchCardAdminProps) {
  const [activeSection, setActiveSection] = useState<'main' | 'lineup' | 'blog'>('main');
  const [homeLineup, setHomeLineup] = useState((match.lineups?.home || []).join('\n'));
  const [awayLineup, setAwayLineup] = useState((match.lineups?.away || []).join('\n'));
  const [newBlogContent, setNewBlogContent] = useState('');

  const statusColors: Record<Match['status'], string> = {
    upcoming: 'bg-yellow-500',
    live: 'bg-red-500',
    finished: 'bg-green-500'
  };

  const updateScore = (team: 'home' | 'away', action: 'increment' | 'decrement') => {
    const currentHomeScore = match.homeScore || 0;
    const currentAwayScore = match.awayScore || 0;
    
    let newHomeScore = currentHomeScore;
    let newAwayScore = currentAwayScore;

    if (team === 'home') {
      newHomeScore = action === 'increment' ? currentHomeScore + 1 : Math.max(0, currentHomeScore - 1);
    } else {
      newAwayScore = action === 'increment' ? currentAwayScore + 1 : Math.max(0, currentAwayScore - 1);
    }
    
    onUpdateMatch(match.id, {
      homeScore: newHomeScore,
      awayScore: newAwayScore
    });

    if (action === 'increment') {
      addBlogPost('goal', `Goal! ${team === 'home' ? homeTeam.name : awayTeam.name} scores!`);
    }
  };

  const updateStatus = (status: Match['status']) => {
    onUpdateMatch(match.id, { status });
  };

  const saveLineups = () => {
    onUpdateMatch(match.id, {
      lineups: {
        home: homeLineup.split('\n').filter(line => line.trim()),
        away: awayLineup.split('\n').filter(line => line.trim())
      }
    });
  };

  const addBlogPost = (type: BlogPost['type'] = 'general', content?: string) => {
    const blogPost: BlogPost = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      content: content || newBlogContent,
      type: type
    };

    const currentPosts = match.blogPosts || [];
    onUpdateMatch(match.id, {
      blogPosts: [...currentPosts, blogPost]
    });

    if (!content) setNewBlogContent('');
  };

  const deleteBlogPost = (postId: number) => {
    const currentPosts = match.blogPosts || [];
    onUpdateMatch(match.id, {
      blogPosts: currentPosts.filter(post => post.id !== postId)
    });
  };

  const extractSrcFromEmbed = (embed: string): string => {
    const srcMatch = embed.match(/src="([^"]*)"/);
    return srcMatch ? srcMatch[1] : '';
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
      {/* Match Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[match.status]}`}>
              {match.status.toUpperCase()}
            </span>
            <span className="text-gray-400">
              {match.date} {match.time && `at ${match.time}`}
              {match.league && ` • ${match.league}`}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onEditMatch(match)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => onDeleteMatch(match.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              Delete
            </button>
          </div>
        </div>
        
        {/* Teams and Score */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            {homeTeam.logo && (
              <img src={homeTeam.logo} alt={homeTeam.name} className="w-12 h-12 object-contain" />
            )}
            <span className="font-medium text-lg">{homeTeam.name}</span>
          </div>
          
          <div className="text-center mx-4">
            <div className="text-3xl font-bold bg-gray-700 px-6 py-2 rounded">
              {match.homeScore} - {match.awayScore}
            </div>
            {match.status === 'live' && (
              <div className="flex space-x-2 mt-2">
                <button 
                  onClick={() => updateScore('home', 'increment')}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                >
                  +1 Home
                </button>
                <button 
                  onClick={() => updateScore('home', 'decrement')}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                >
                  -1 Home
                </button>
                <button 
                  onClick={() => updateScore('away', 'increment')}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                >
                  +1 Away
                </button>
                <button 
                  onClick={() => updateScore('away', 'decrement')}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                >
                  -1 Away
                </button>
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

        {/* Status Controls */}
        <div className="flex justify-center space-x-4">
          {match.status !== 'live' && (
            <button
              onClick={() => updateStatus('live')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Start Match
            </button>
          )}
          {match.status === 'live' && (
            <button
              onClick={() => updateStatus('finished')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              End Match
            </button>
          )}
          {match.status === 'finished' && (
            <button
              onClick={() => updateStatus('upcoming')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
            >
              Reset to Upcoming
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveSection('main')}
          className={`flex-1 py-3 font-medium ${activeSection === 'main' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
        >
          Stream & Info
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

      {/* Main Section */}
      {activeSection === 'main' && (
        <div className="p-6">
          <div className="aspect-video bg-black mb-4">
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
          <div className="grid md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">{homeTeam.name} Lineup</label>
              <textarea
                value={homeLineup}
                onChange={(e) => setHomeLineup(e.target.value)}
                className="w-full h-48 px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter players line by line..."
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-medium">{awayTeam.name} Lineup</label>
              <textarea
                value={awayLineup}
                onChange={(e) => setAwayLineup(e.target.value)}
                className="w-full h-48 px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter players line by line..."
              />
            </div>
          </div>
          <button
            onClick={saveLineups}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Save Lineups
          </button>
        </div>
      )}

      {/* Blog Section */}
      {activeSection === 'blog' && (
        <div className="p-6">
          <div className="mb-4">
            <textarea
              value={newBlogContent}
              onChange={(e) => setNewBlogContent(e.target.value)}
              className="w-full h-20 px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a live blog update..."
            />
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => addBlogPost('general')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
              >
                Add Update
              </button>
              <button
                onClick={() => addBlogPost('goal', `Goal! ${homeTeam.name} scores!`)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                Goal (Home)
              </button>
              <button
                onClick={() => addBlogPost('goal', `Goal! ${awayTeam.name} scores!`)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                Goal (Away)
              </button>
            </div>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {match.blogPosts.slice().reverse().map(post => (
              <div key={post.id} className="bg-gray-700 p-3 rounded">
                <div className="flex justify-between items-start">
                  <span className="text-blue-400 text-sm">[{post.timestamp}]</span>
                  <button
                    onClick={() => deleteBlogPost(post.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
                <p>{post.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
   
  );
}