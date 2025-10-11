'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { APIMatch, fetchFootballMatches, getAvailableLeagues } from '../lib/api/sportsdb-api';
import { autoRegisterTeams } from '../lib/api/team-logo-services';
import { Team } from '../types';
import { addMatch, addTeamapi, getTeams } from '../lib/supabase-service';
import "react-datepicker/dist/react-datepicker.css";

interface AutoMatchGeneratorProps {
  onMatchesAdded: () => void;
}

interface SelectableMatch extends APIMatch {
  selected: boolean;
  streamEmbed: string;
}

export default function AutoMatchGenerator({ onMatchesAdded }: AutoMatchGeneratorProps) {
  const [allMatches, setAllMatches] = useState<SelectableMatch[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<SelectableMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [message, setMessage] = useState('');
  const [availableLeagues, setAvailableLeagues] = useState<string[]>([]);
  
  // Frontend filter states
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'tomorrow' | 'week' | 'nextWeek' | 'custom'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [matchStatus, setMatchStatus] = useState<'all' | 'timed' | 'scheduled' | 'live' | 'finished'>('scheduled');
  const [autoRegister, setAutoRegister] = useState(true);
  
  // Date picker states
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // SAFETY CHECK - prevents map error
  const safeAvailableLeagues = Array.isArray(availableLeagues) ? availableLeagues : [];

  useEffect(() => {
    loadTeams();
  }, []);

  // Apply ALL filtering on the frontend
  useEffect(() => {
    applyFrontendFilters();
  }, [allMatches, selectedLeagues, dateRange, searchQuery, matchStatus, startDate, endDate]);

  const loadTeams = async () => {
    try {
      const teamsData = await getTeams();
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const fetchAPIMatches = async () => {
    setIsLoading(true);
    setMessage('Fetching matches from API...');
    
    try {
      const matches = await fetchFootballMatches();
      
      if (matches.length === 0) {
        setMessage('No matches found.');
        setAllMatches([]);
        setAvailableLeagues([]);
        return;
      }

      const leagues = await getAvailableLeagues(matches);
      setAvailableLeagues(leagues);
      setSelectedLeagues(leagues);

      const selectableMatches: SelectableMatch[] = matches.map(match => ({
        ...match,
        selected: false,
        streamEmbed: ''
      }));
      
      setAllMatches(selectableMatches);
      setMessage(`Found ${selectableMatches.length} matches from ${leagues.length} leagues`);
      
    } catch (error) {
      console.error('Error fetching matches:', error);
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setAvailableLeagues([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFrontendFilters = () => {
    if (allMatches.length === 0) {
      setFilteredMatches([]);
      return;
    }

    let filtered = [...allMatches];

    // 1. League filter - FIXED: Now updates when search query changes
    if (selectedLeagues.length > 0) {
      filtered = filtered.filter(match => 
        selectedLeagues.includes(match.competition.name)
      );
    }

    // 2. Status filter
    if (matchStatus !== 'all') {
      filtered = filtered.filter(match => {
        const status = match.status.toLowerCase();
        switch (matchStatus) {
          case 'scheduled': return status === 'scheduled';
          case 'live': return status === 'live' || status === 'in_play';
          case 'finished': return status === 'finished' || status === 'completed';
          default: return true;
        }
      });
    }

    // 3. Date filter - ENHANCED with custom date picker
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    switch (dateRange) {
      case 'today':
        filtered = filtered.filter(match => {
          const matchDate = new Date(match.utcDate);
          const matchDayUTC = new Date(Date.UTC(matchDate.getUTCFullYear(), matchDate.getUTCMonth(), matchDate.getUTCDate()));
          return matchDayUTC.getTime() === todayUTC.getTime();
        });
        break;
        
      case 'tomorrow':
        const tomorrowUTC = new Date(todayUTC);
        tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);
        filtered = filtered.filter(match => {
          const matchDate = new Date(match.utcDate);
          const matchDayUTC = new Date(Date.UTC(matchDate.getUTCFullYear(), matchDate.getUTCMonth(), matchDate.getUTCDate()));
          return matchDayUTC.getTime() === tomorrowUTC.getTime();
        });
        break;
        
      case 'week':
        const endOfWeekUTC = new Date(todayUTC);
        endOfWeekUTC.setUTCDate(endOfWeekUTC.getUTCDate() + 7);
        filtered = filtered.filter(match => {
          const matchDate = new Date(match.utcDate);
          return matchDate >= todayUTC && matchDate < endOfWeekUTC;
        });
        break;
        
      case 'nextWeek':
        const startOfNextWeekUTC = new Date(todayUTC);
        startOfNextWeekUTC.setUTCDate(startOfNextWeekUTC.getUTCDate() + 7);
        const endOfNextWeekUTC = new Date(startOfNextWeekUTC);
        endOfNextWeekUTC.setUTCDate(endOfNextWeekUTC.getUTCDate() + 7);
        filtered = filtered.filter(match => {
          const matchDate = new Date(match.utcDate);
          return matchDate >= startOfNextWeekUTC && matchDate < endOfNextWeekUTC;
        });
        break;
        
      case 'custom':
        if (startDate && endDate) {
          const customStartUTC = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
          const customEndUTC = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()));
          customEndUTC.setUTCDate(customEndUTC.getUTCDate() + 1); // Include end date
          
          filtered = filtered.filter(match => {
            const matchDate = new Date(match.utcDate);
            return matchDate >= customStartUTC && matchDate < customEndUTC;
          });
        }
        break;
    }

    // 4. Search filter - FIXED: Now properly filters leagues in real-time
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(match => {
        const homeTeamName = match.homeTeam?.name?.toLowerCase() || '';
        const awayTeamName = match.awayTeam?.name?.toLowerCase() || '';
        const leagueName = match.competition?.name?.toLowerCase() || '';
        
        return (
          homeTeamName.includes(query) ||
          awayTeamName.includes(query) ||
          leagueName.includes(query)
        );
      });
    }

    console.log(`🔍 Filtered to ${filtered.length} matches`);
    setFilteredMatches(filtered);
  };

  const toggleLeague = (league: string) => {
    setSelectedLeagues(prev => 
      prev.includes(league) 
        ? prev.filter(l => l !== league)
        : [...prev, league]
    );
  };

  const selectAllLeagues = () => {
    setSelectedLeagues([...safeAvailableLeagues]);
  };

  const clearLeagues = () => {
    setSelectedLeagues([]);
  };

  // Filter leagues based on search query for display
  const filteredLeaguesForDisplay = safeAvailableLeagues.filter(league => 
    league.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOrCreateTeam = async (teamName: string, league: string): Promise<number> => {
    try {
      const existingTeam = teams.find(t => t.name === teamName);
      if (existingTeam) {
        return existingTeam.id;
      }

      if (autoRegister) {
        const fakeMatch = {
          strHomeTeam: teamName,
          strAwayTeam: '',
          strLeague: league
        } as any;
        
        const teamData = await autoRegisterTeams([fakeMatch]);
        const newTeam = teamData.find(t => t.name === teamName);
        if (newTeam) {
          setTeams(prev => [...prev, newTeam]);
          return newTeam.id;
        }
      }
      
      return -1;
    } catch (error) {
      console.error('Error in getOrCreateTeam:', error);
      return -1;
    }
  };

// In your AutoMatchGenerator.tsx - ADD DATA STRUCTURE DEBUGGING
const saveSelectedMatches = async () => {
  const selectedMatches = filteredMatches.filter(match => match.selected);
  
  console.log('🔄 Starting saveSelectedMatches with:', selectedMatches.length, 'matches');
  
  // DEBUG: Check the actual structure of the first match
  if (selectedMatches.length > 0) {
    console.log('🔍 FIRST MATCH FULL STRUCTURE:', JSON.stringify(selectedMatches[0], null, 2));
    console.log('🔍 Home team type:', typeof selectedMatches[0].homeTeam);
    console.log('🔍 Home team value:', selectedMatches[0].homeTeam);
    console.log('🔍 Away team type:', typeof selectedMatches[0].awayTeam);
    console.log('🔍 Away team value:', selectedMatches[0].awayTeam);
  }

  if (selectedMatches.length === 0) {
    setMessage('Please select at least one match');
    return;
  }

  setIsSaving(true);
  setMessage(`Saving ${selectedMatches.length} matches...`);

  try {
    let successCount = 0;
    let errorCount = 0;

    // Skip autoRegisterTeams for now and create teams directly
    for (const apiMatch of selectedMatches) {
      try {
        console.log(`🔄 Processing match:`, apiMatch);
        
        // CREATE TEAMS DIRECTLY WITHOUT autoRegisterTeams
        console.log('🔍 Creating home team directly...');
        const homeTeamId = await createTeamDirect(apiMatch);
        
        console.log('🔍 Creating away team directly...');
        const awayTeamId = await createTeamDirect(apiMatch, false);

        console.log(`🏟️ Team IDs - Home: ${homeTeamId}, Away: ${awayTeamId}`);

        if (homeTeamId === -1 || awayTeamId === -1) {
          console.error(`❌ Missing team IDs for ${getTeamName(apiMatch, true)} vs ${getTeamName(apiMatch, false)}`);
          errorCount++;
          continue;
        }

        const matchDate = new Date(apiMatch.utcDate);
        const dateStr = matchDate.toISOString().split('T')[0];
        const timeStr = matchDate.toISOString().split('T')[1]?.substring(0, 5) || '00:00';

        const matchData = {
          homeTeamId: homeTeamId,
          awayTeamId: awayTeamId,
          date: dateStr,
          time: timeStr,
          streamEmbed: apiMatch.streamEmbed || '<div>Stream link not added yet</div>',
          status: 'upcoming' as const,
          homeScore: apiMatch.score?.fullTime?.home || 0,
          awayScore: apiMatch.score?.fullTime?.away || 0,
          lineups: { home: [], away: [] },
          blogPosts: [],
          league: apiMatch.competition?.name || 'Unknown League'
        };

        console.log(`📝 Saving match data:`, matchData);
        const result = await addMatch(matchData);
        
        if (result) {
          console.log(`✅ Match saved: ${getTeamName(apiMatch, true)} vs ${getTeamName(apiMatch, false)}`);
          successCount++;
        } else {
          console.error(`❌ Failed to save match: ${getTeamName(apiMatch, true)} vs ${getTeamName(apiMatch, false)}`);
          errorCount++;
        }
      } catch (matchError) {
        console.error('❌ Error saving individual match:', matchError);
        errorCount++;
      }
    }

    const resultMessage = `Successfully added ${successCount} matches${errorCount > 0 ? `, ${errorCount} failed` : ''}`;
    setMessage(resultMessage);
    
    if (successCount > 0) {
      onMatchesAdded();
      setAllMatches(prev => prev.map(match => ({ ...match, selected: false })));
    }
  } catch (error) {
    console.error('💥 Error saving matches:', error);
    setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setIsSaving(false);
  }
};

// Helper function to get team name safely
function getTeamName(match: any, isHome: boolean): string {
  if (isHome) {
    return match.homeTeam?.name || match.strHomeTeam || 'Home Team';
  } else {
    return match.awayTeam?.name || match.strAwayTeam || 'Away Team';
  }
}

// DIRECT TEAM CREATION FUNCTION
async function createTeamDirect(match: any, isHome: boolean = true): Promise<number> {
  try {
    let teamData;
    let teamName;
    
    if (isHome) {
      teamData = match.homeTeam;
      teamName = match.homeTeam?.name || match.strHomeTeam;
    } else {
      teamData = match.awayTeam;
      teamName = match.awayTeam?.name || match.strAwayTeam;
    }
    
    console.log(`🔍 Creating ${isHome ? 'home' : 'away'} team: "${teamName}"`);
    console.log(`🔍 Team data:`, teamData);
    console.log(`🔍 Full match structure:`, match);
    
    if (!teamName) {
      console.error(`❌ No team name found for ${isHome ? 'home' : 'away'} team`);
      return -1;
    }
    
    // Check if team exists
    const existingTeams = await getTeams();
    const existingTeam = existingTeams.find(t => t.name === teamName);
    
    if (existingTeam) {
      console.log(`✅ Team found: "${teamName}" (ID: ${existingTeam.id})`);
      return existingTeam.id;
    }
    
    // Create new team
    const country = match.competition?.area?.name || getCountryFromLeague(match.competition?.name) || 'International';
    
    // Try to get logo from API data
    let logo = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjI0IiB5PSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VEVBTTwvdGV4dD4KPC9zdmc+';
    
    // Try different possible logo fields
    if (teamData?.crest) {
      logo = teamData.crest;
    } else if (teamData?.logo) {
      logo = teamData.logo;
    } else if (match[isHome ? 'logoHome' : 'logoAway']) {
      logo = match[isHome ? 'logoHome' : 'logoAway'];
    }
    
    const teamToCreate = {
      name: teamName,
      logo: logo,
      country: country,
    };
    
    console.log(`📝 Creating team with data:`, teamToCreate);
    const newTeam = await addTeamapi(teamToCreate);
    
    if (newTeam) {
      console.log(`🎉 Team created: "${teamName}" (ID: ${newTeam.id})`);
      return newTeam.id;
    } else {
      console.error(`❌ Failed to create team: "${teamName}"`);
      return -1;
    }
    
  } catch (error) {
    console.error(`💥 Error creating team:`, error);
    return -1;
  }
}

// Helper function to get country from league
function getCountryFromLeague(leagueName?: string): string {
  if (!leagueName) return 'International';
  
  const name = leagueName.toLowerCase();
  if (name.includes('premier league')) return 'England';
  if (name.includes('la liga')) return 'Spain';
  if (name.includes('serie a')) return 'Italy';
  if (name.includes('bundesliga')) return 'Germany';
  if (name.includes('ligue 1')) return 'France';
  if (name.includes('champions league')) return 'Europe';
  
  return 'International';
}


  const selectedCount = filteredMatches.filter(match => match.selected).length;
  
  const toggleMatchSelection = (index: number) => {
    const updatedFilteredMatches = [...filteredMatches];
    const matchToUpdate = updatedFilteredMatches[index];
    matchToUpdate.selected = !matchToUpdate.selected;
    setFilteredMatches(updatedFilteredMatches);
    
    setAllMatches(prev => prev.map(match => 
      match.id === matchToUpdate.id 
        ? { ...match, selected: matchToUpdate.selected }
        : match
    ));
  };

  const updateStreamEmbed = (index: number, value: string) => {
    const updatedFilteredMatches = [...filteredMatches];
    const matchToUpdate = updatedFilteredMatches[index];
    matchToUpdate.streamEmbed = value;
    setFilteredMatches(updatedFilteredMatches);
    
    setAllMatches(prev => prev.map(match => 
      match.id === matchToUpdate.id 
        ? { ...match, streamEmbed: value }
        : match
    ));
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Auto Match Generator</h2>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRegister}
              onChange={(e) => setAutoRegister(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Auto-register teams</span>
          </label>
          
          <button
            onClick={fetchAPIMatches}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded"
          >
            {isLoading ? 'Fetching...' : 'Fetch Matches'}
          </button>
          
          {selectedCount > 0 && (
            <button
              onClick={saveSelectedMatches}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded"
            >
              {isSaving ? 'Saving...' : `Add Selected (${selectedCount})`}
            </button>
          )}
        </div>
      </div>

      {/* Combined Frontend Filters */}
      {allMatches.length > 0 && (
        <div className="mb-6 p-4 bg-gray-750 rounded space-y-4">
          <h3 className="font-bold mb-3">Filter Matches:</h3>
          
          {/* Search - FIXED: Now properly filters leagues in real-time */}
          <div>
            <input
              type="text"
              placeholder="Search teams or leagues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded text-white placeholder-gray-400"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-4">
            <span className="text-sm font-medium">Status:</span>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="scheduled"
                checked={matchStatus === 'scheduled'}
                onChange={(e) => setMatchStatus(e.target.value as any)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Scheduled</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="live"
                checked={matchStatus === 'live'}
                onChange={(e) => setMatchStatus(e.target.value as any)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Live</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="finished"
                checked={matchStatus === 'finished'}
                onChange={(e) => setMatchStatus(e.target.value as any)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Finished</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="all"
                checked={matchStatus === 'all'}
                onChange={(e) => setMatchStatus(e.target.value as any)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">All</span>
            </label>
          </div>

          {/* ENHANCED Date Range - Added Custom Date Picker */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-4 items-center">
              <span className="text-sm font-medium">Date:</span>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="today"
                  checked={dateRange === 'today'}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Today</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="tomorrow"
                  checked={dateRange === 'tomorrow'}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Tomorrow</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="week"
                  checked={dateRange === 'week'}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">This Week</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="nextWeek"
                  checked={dateRange === 'nextWeek'}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Next Week</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="custom"
                  checked={dateRange === 'custom'}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Custom Range</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="all"
                  checked={dateRange === 'all'}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">All Dates</span>
              </label>
            </div>

            {/* Custom Date Picker - Only shows when custom is selected */}
            {dateRange === 'custom' && (
              <div className="flex flex-wrap gap-4 items-center p-3 bg-gray-700 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">From:</span>
                  <DatePicker
                    selected={startDate}
                    onChange={setStartDate}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    className="px-3 py-1 bg-gray-600 rounded text-white text-sm"
                    placeholderText="Start date"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">To:</span>
                  <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate ?? undefined}
                    className="px-3 py-1 bg-gray-600 rounded text-white text-sm"
                    placeholderText="End date"
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate(null);
                      setEndDate(null);
                    }}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                  >
                    Clear Dates
                  </button>
                )}
              </div>
            )}
          </div>

          {/* FIXED League Filters - Now updates in real-time with search */}
          {safeAvailableLeagues.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  Leagues: 
                  <span className="text-gray-400 ml-2">
                    Showing {filteredLeaguesForDisplay.length} of {safeAvailableLeagues.length}
                  </span>
                </span>
                <div className="flex space-x-2">
                  <button onClick={selectAllLeagues} className="text-blue-400 hover:text-blue-300 text-sm">
                    Select All
                  </button>
                  <button onClick={clearLeagues} className="text-gray-400 hover:text-gray-300 text-sm">
                    Clear
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-gray-700 rounded">
                {filteredLeaguesForDisplay.map(league => (
                  <button
                    key={league}
                    onClick={() => toggleLeague(league)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      selectedLeagues.includes(league)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {league}
                  </button>
                ))}
                {filteredLeaguesForDisplay.length === 0 && (
                  <span className="text-gray-400 text-sm">No leagues match your search</span>
                )}
              </div>
            </div>
          )}

          {/* FIXED Filter Stats - Now updates properly */}
          <div className="text-xs text-gray-400">
            Showing {filteredMatches.length} of {allMatches.length} matches
            {selectedLeagues.length > 0 && ` • ${selectedLeagues.length} league(s) selected`}
            {dateRange !== 'all' && ` • ${dateRange}`}
            {searchQuery && ` • searching: "${searchQuery}"`}
          </div>
        </div>
      )}

      {message && (
        <div className={`p-3 rounded mb-4 ${
          message.includes('Error') ? 'bg-red-600' : 
          message.includes('Success') ? 'bg-green-600' :
          'bg-blue-600'
        }`}>
          {message}
        </div>
      )}

      {/* Matches List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredMatches.map((match, index) => {
          const matchDate = new Date(match.utcDate);
          const dateStr = matchDate.toISOString().split('T')[0];
          const timeStr = matchDate.toISOString().split('T')[1]?.substring(0, 5) || '00:00';
          const homeScore = match.score?.fullTime?.home ?? 0;
          const awayScore = match.score?.fullTime?.away ?? 0;

          return (
            <div
              key={`${match.id}-${index}`}
              className={`p-4 rounded border-2 transition-all ${
                match.selected 
                  ? 'border-green-500 bg-gray-750' 
                  : 'border-gray-600 bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={match.selected}
                    onChange={() => toggleMatchSelection(index)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className={`px-2 py-1 rounded text-xs ${
                    match.status === 'SCHEDULED' ? 'bg-yellow-500' :
                    match.status === 'LIVE' ? 'bg-green-500' :
                    match.status === 'FINISHED' ? 'bg-gray-500' :
                    'bg-blue-500'
                  }`}>
                    {match.status}
                  </span>
                  <span className="text-sm text-gray-400">{match.competition.name}</span>
                </div>
                <div className="text-sm text-gray-400">
                  {dateStr} at {timeStr}
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="text-center flex-1">
                  <div className="font-bold text-sm">{match.homeTeam.name}</div>
                  <div className="text-xl font-bold mt-1">{homeScore}</div>
                </div>
                
                <div className="text-center mx-2 flex-shrink-0">
                  <div className="text-gray-400 text-xs">VS</div>
                  <div className="text-lg font-bold bg-gray-600 px-3 py-1 rounded">
                    {homeScore} - {awayScore}
                  </div>
                </div>
                
                <div className="text-center flex-1">
                  <div className="font-bold text-sm">{match.awayTeam.name}</div>
                  <div className="text-xl font-bold mt-1">{awayScore}</div>
                </div>
              </div>

              {match.selected && (
                <div className="mt-3 p-3 bg-gray-600 rounded">
                  <label className="block text-sm font-medium mb-2">
                    Stream Embed Code:
                  </label>
                  <textarea
                    value={match.streamEmbed}
                    onChange={(e) => updateStreamEmbed(index, e.target.value)}
                    placeholder='<iframe src="https://example.com/embed/..." width="100%" height="500"></iframe>'
                    className="w-full h-20 px-3 py-2 bg-gray-700 rounded text-sm"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredMatches.length === 0 && !isLoading && allMatches.length > 0 && (
        <div className="text-center py-8 text-gray-400">
          No matches found with current filters
        </div>
      )}

      {allMatches.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-400">
          Click "Fetch Matches" to load matches
        </div>
      )}
    </div>
  );
}