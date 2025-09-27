// lib/data-service.ts
import { kv } from '@vercel/kv';

// Check if environment variables are available
if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  console.warn('Vercel KV environment variables missing. Using fallback storage.');
}

const MATCHES_KEY = 'football-matches';
const TEAMS_KEY = 'football-teams';

// Fallback to localStorage if KV is not available
const useFallback = !process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN;

// Fallback functions using localStorage
const fallbackGetMatches = (): any[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(MATCHES_KEY);
  return saved ? JSON.parse(saved) : [];
};

const fallbackSaveMatches = (matches: any[]): boolean => {
  if (typeof window === 'undefined') return false;
  localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
  return true;
};

const fallbackGetTeams = (): any[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(TEAMS_KEY);
  return saved ? JSON.parse(saved) : [];
};

const fallbackSaveTeams = (teams: any[]): boolean => {
  if (typeof window === 'undefined') return false;
  localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
  return true;
};

// Main functions with fallback
export async function getMatches(): Promise<any[]> {
  if (useFallback) {
    return fallbackGetMatches();
  }

  try {
    const matches = await kv.get<any[]>(MATCHES_KEY);
    return matches || [];
  } catch (error) {
    console.error('Error getting matches from KV, using fallback:', error);
    return fallbackGetMatches();
  }
}

export async function saveMatches(matches: any[]): Promise<boolean> {
  if (useFallback) {
    return fallbackSaveMatches(matches);
  }

  try {
    await kv.set(MATCHES_KEY, matches);
    console.log('Matches saved to KV');
    return true;
  } catch (error) {
    console.error('Error saving matches to KV, using fallback:', error);
    return fallbackSaveMatches(matches);
  }
}

export async function getTeams(): Promise<any[]> {
  if (useFallback) {
    return fallbackGetTeams();
  }

  try {
    const teams = await kv.get<any[]>(TEAMS_KEY);
    return teams || [];
  } catch (error) {
    console.error('Error getting teams from KV, using fallback:', error);
    return fallbackGetTeams();
  }
}

export async function saveTeams(teams: any[]): Promise<boolean> {
  if (useFallback) {
    return fallbackSaveTeams(teams);
  }

  try {
    await kv.set(TEAMS_KEY, teams);
    console.log('Teams saved to KV');
    return true;
  } catch (error) {
    console.error('Error saving teams to KV, using fallback:', error);
    return fallbackSaveTeams(teams);
  }
}

// Add the missing functions that AdminPanel expects
export async function addMatch(matchData: any): Promise<boolean> {
  try {
    const matches = await getMatches();
    const newMatch = {
      ...matchData,
      id: Date.now(),
      status: 'upcoming',
      homeScore: 0,
      awayScore: 0,
      lineups: { home: [], away: [] },
      blogPosts: []
    };
    
    matches.push(newMatch);
    return await saveMatches(matches);
  } catch (error) {
    console.error('Error adding match:', error);
    return false;
  }
}

export async function updateMatch(matchId: number, updates: any): Promise<boolean> {
  try {
    const matches = await getMatches();
    const matchIndex = matches.findIndex(match => match.id === matchId);
    
    if (matchIndex === -1) {
      console.error('Match not found:', matchId);
      return false;
    }
    
    matches[matchIndex] = { ...matches[matchIndex], ...updates };
    return await saveMatches(matches);
  } catch (error) {
    console.error('Error updating match:', error);
    return false;
  }
}

export async function deleteMatch(matchId: number): Promise<boolean> {
  try {
    const matches = await getMatches();
    const filteredMatches = matches.filter(match => match.id !== matchId);
    return await saveMatches(filteredMatches);
  } catch (error) {
    console.error('Error deleting match:', error);
    return false;
  }
}

export async function addTeam(teamData: any): Promise<boolean> {
  try {
    const teams = await getTeams();
    const newTeam = {
      ...teamData,
      id: Date.now()
    };
    
    teams.push(newTeam);
    return await saveTeams(teams);
  } catch (error) {
    console.error('Error adding team:', error);
    return false;
  }
}

export async function updateTeam(teamId: number, updates: any): Promise<boolean> {
  try {
    const teams = await getTeams();
    const teamIndex = teams.findIndex(team => team.id === teamId);
    
    if (teamIndex === -1) {
      console.error('Team not found:', teamId);
      return false;
    }
    
    teams[teamIndex] = { ...teams[teamIndex], ...updates };
    return await saveTeams(teams);
  } catch (error) {
    console.error('Error updating team:', error);
    return false;
  }
}

export async function deleteTeam(teamId: number): Promise<boolean> {
  try {
    const teams = await getTeams();
    const filteredTeams = teams.filter(team => team.id !== teamId);
    return await saveTeams(filteredTeams);
  } catch (error) {
    console.error('Error deleting team:', error);
    return false;
  }
}

// Test connection
export async function testKVConnection(): Promise<boolean> {
  if (useFallback) {
    console.log('Using localStorage fallback');
    return false;
  }

  try {
    await kv.set('connection-test', 'success');
    const result = await kv.get('connection-test');
    console.log('KV Connection test:', result === 'success' ? '✅ Success' : '❌ Failed');
    return result === 'success';
  } catch (error) {
    console.error('KV Connection test failed:', error);
    return false;
  }
}