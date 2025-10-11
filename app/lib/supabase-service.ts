// lib/supabase-service.ts
import { supabase } from './supabase';
import { Team, Match, BlogPost } from '../types';

// Teams functions
// Add to lib/supabase-service.ts if not already there
export async function addTeamapi(teamData: Omit<Team, 'id'>): Promise<Team | null> {
  try {
    const { data, error } = await supabase
      .from('teams')
      .insert([teamData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding team:', error);
    return null;
  }
}
// lib/supabase-service.ts - UPDATE addTeam function (Backward Compatible)
export async function addTeam(teamData: Partial<Team>): Promise<Team | null> {
  try {
    const { data, error } = await supabase
      .from('teams')
      .insert([
        {
          // Required fields (existing)
          name: teamData.name,
          logo: teamData.logo,
          country: teamData.country,
          
          // New optional fields
          
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding team:', error);
      return null;
    }

    // Transform back to Team interface - BACKWARD COMPATIBLE
    return {
      id: data.id,
      name: data.name,
      logo: data.logo,
      country: data.country,
      // New fields
     
     
    };
  } catch (error) {
    console.error('Error in addTeam:', error);
    return null;
  }
}

// Also update getTeams to include new fields

export async function getTeams(): Promise<Team[]> {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching teams:', error);
      return [];
    }

    // SIMPLIFIED - Only map fields that actually exist in your database
    return data.map(team => ({
      id: team.id,
      name: team.name,
      logo: team.logo,
      country: team.country,
      // Remove the new fields that don't exist in your database
      // shortName: team.short_name, // This field doesn't exist
      // tla: team.tla, // This field doesn't exist
      // crest: team.crest, // This field doesn't exist
      // founded: team.founded, // This field doesn't exist
      // venue: team.venue, // This field doesn't exist
      // website: team.website, // This field doesn't exist
      // colors: team.colors, // This field doesn't exist
      // createdAt: team.created_at, // This field doesn't exist
    }));
  } catch (error) {
    console.error('Error in getTeams:', error);
    return [];
  }
}



export async function updateTeam(teamId: number, updates: Partial<Team>): Promise<Team | null> {
  try {
    const { data, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', teamId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating team:', error);
    return null;
  }
}

export async function deleteTeam(teamId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting team:', error);
    return false;
  }
}

// Matches functions
export async function getMatches(): Promise<Match[]> {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!home_team_id(id, name, logo, country),
        away_team:teams!away_team_id(id, name, logo, country)
      `)
      .order('date')
      .order('time');

    if (error) throw error;
    
    return data.map(match => ({
      id: match.id,
      homeTeamId: match.home_team_id,
      awayTeamId: match.away_team_id,
      date: match.date,
      time: match.time,
      streamEmbed: match.stream_embed,
      status: match.status,
      homeScore: match.home_score,
      awayScore: match.away_score,
      lineups: match.lineups,
      blogPosts: match.blog_posts,
      league: match.league,
      slug: match.slug // Include slug
    }));
  } catch (error) {
    console.error('Error getting matches:', error);
    return [];
  }
}

// lib/supabase-service.ts
// Update your addMatch function:
export async function addMatch(matchData: Omit<Match, 'id' | 'slug'>): Promise<Match | null> {
  try {
    const teams = await getTeams();
    const homeTeam = teams.find(t => t.id === matchData.homeTeamId);
    const awayTeam = teams.find(t => t.id === matchData.awayTeamId);
    
    if (!homeTeam || !awayTeam) {
      throw new Error('Teams not found');
    }

    // Generate SEO-friendly URL slug
    const slug = `${homeTeam.name.toLowerCase().replace(/ /g, '-')}-vs-${awayTeam.name.toLowerCase().replace(/ /g, '-')}-${new Date(matchData.date).getFullYear()}`;
    
    const dbMatch = {
      home_team_id: matchData.homeTeamId,
      away_team_id: matchData.awayTeamId,
      date: matchData.date,
      time: matchData.time,
      stream_embed: matchData.streamEmbed,
      status: matchData.status,
      home_score: matchData.homeScore,
      away_score: matchData.awayScore,
      lineups: matchData.lineups,
      blog_posts: matchData.blogPosts,
      league: matchData.league,
      slug: slug // Add the slug
    };

    const { data, error } = await supabase
      .from('matches')
      .insert([dbMatch])
      .select(`
        *,
        home_team:teams!home_team_id(id, name, logo, country),
        away_team:teams!away_team_id(id, name, logo, country)
      `)
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      homeTeamId: data.home_team_id,
      awayTeamId: data.away_team_id,
      date: data.date,
      time: data.time,
      streamEmbed: data.stream_embed,
      status: data.status,
      homeScore: data.home_score,
      awayScore: data.away_score,
      lineups: data.lineups,
      blogPosts: data.blog_posts,
      league: data.league,
      slug: data.slug // Include slug in return
    };
  } catch (error) {
    console.error('Error adding match:', error);
    return null;
  }
}

// Update getMatches to include slug


// Add function to get match by slug
// lib/supabase-service.ts - Update getMatchBySlug
// lib/supabase-service.ts - Update getMatchBySlug
export async function getMatchBySlug(slug: string): Promise<Match | null> {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!home_team_id(id, name, logo, country),
        away_team:teams!away_team_id(id, name, logo, country)
      `)
      .eq('slug', slug)
      .single();

    // Handle "no rows" error gracefully
    if (error && error.code === 'PGRST116') {
      console.log(`No match found with slug: ${slug}`);
      return null;
    }

    if (error) throw error;
    
    if (!data) return null;

    return {
      id: data.id,
      homeTeamId: data.home_team_id,
      awayTeamId: data.away_team_id,
      date: data.date,
      time: data.time,
      streamEmbed: data.stream_embed,
      status: data.status,
      homeScore: data.home_score,
      awayScore: data.away_score,
      lineups: data.lineups,
      blogPosts: data.blog_posts,
      league: data.league,
      slug: data.slug,
      homeTeam: data.home_team,
      awayTeam: data.away_team
    };
  } catch (error) {
    console.error('Error getting match by slug:', error);
    return null;
  }
}
export async function updateMatch(matchId: number, updates: Partial<Match>): Promise<Match | null> {
  try {
    // Convert to database format
    const dbUpdates: any = {};
    if (updates.homeTeamId !== undefined) dbUpdates.home_team_id = updates.homeTeamId;
    if (updates.awayTeamId !== undefined) dbUpdates.away_team_id = updates.awayTeamId;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.time !== undefined) dbUpdates.time = updates.time;
    if (updates.streamEmbed !== undefined) dbUpdates.stream_embed = updates.streamEmbed;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.homeScore !== undefined) dbUpdates.home_score = updates.homeScore;
    if (updates.awayScore !== undefined) dbUpdates.away_score = updates.awayScore;
    if (updates.lineups !== undefined) dbUpdates.lineups = updates.lineups;
    if (updates.blogPosts !== undefined) dbUpdates.blog_posts = updates.blogPosts;
    if (updates.league !== undefined) dbUpdates.league = updates.league;

    const { data, error } = await supabase
      .from('matches')
      .update(dbUpdates)
      .eq('id', matchId)
      .select(`
        *,
        home_team:teams!home_team_id(id, name, logo, country),
        away_team:teams!away_team_id(id, name, logo, country)
      `)
      .single();

    if (error) throw error;
    
    // Convert back to app format
    return {
      id: data.id,
      homeTeamId: data.home_team_id,
      awayTeamId: data.away_team_id,
      date: data.date,
      time: data.time,
      streamEmbed: data.stream_embed,
      status: data.status,
      homeScore: data.home_score,
      awayScore: data.away_score,
      lineups: data.lineups,
      blogPosts: data.blog_posts,
      league: data.league,
       slug: data.slug
    };
  } catch (error) {
    console.error('Error updating match:', error);
    return null;
  }
}

export async function deleteMatch(matchId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting match:', error);
    return false;
  }
}

// Test connection
export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('teams').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
}