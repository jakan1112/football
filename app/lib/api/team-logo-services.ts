// lib/api/team-logo-services.ts - USING API LOGOS
import { Team } from "../../types";
import { getTeams, addTeam } from "../supabase-service";

export interface APIMatch {
  id: string;
  utcDate: string;
  status: string;
  matchday: number;
  homeTeam: {
    id: number;
    name: string;
    shortName?: string;
    tla?: string;
    crest?: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName?: string;
    tla?: string;
    crest?: string;
  };
  competition: {
    name: string;
    area?: {
      name: string;
      code: string;
      flag?: string;
    };
  };
}

// Default logo fallback
const DEFAULT_LOGO = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjI0IiB5PSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+VEVBTTwvdGV4dD4KPC9zdmc+';

// Get country from league/competition
function getCountryFromCompetition(competition: any): string {
  if (competition.area?.name) {
    return competition.area.name;
  }
  
  // Fallback based on competition name
  const compName = competition.name.toLowerCase();
  if (compName.includes('premier league')) return 'England';
  if (compName.includes('la liga')) return 'Spain';
  if (compName.includes('serie a')) return 'Italy';
  if (compName.includes('bundesliga')) return 'Germany';
  if (compName.includes('ligue 1')) return 'France';
  if (compName.includes('champions league')) return 'Europe';
  
  return 'International';
}

// Get logo from API team data - USE THE ACTUAL CREST FROM API
function getTeamLogo(teamData: any): string {
 
  
  // Use the crest URL from the API if available
  if (teamData.crest) {
    
    return teamData.crest;
  }
  
  return DEFAULT_LOGO;
}

// Create team data using API information
function createTeamData(teamData: any, competition: any): Partial<Team> {
  const logo = getTeamLogo(teamData);
  const country = getCountryFromCompetition(competition);
  
  console.log(`📝 Creating team data for: "${teamData.name}"`, { 
    logo, 
    country,
    hasCrest: !!teamData.crest 
  });
  
  return {
    name: teamData.name,
    logo: logo,
    country: country,
  };
}

// AUTO-REGISTER TEAMS USING API DATA
export async function autoRegisterTeams(matches: APIMatch[]): Promise<Team[]> {
  
  
  const registeredTeams: Team[] = [];
  const uniqueTeams = new Map<string, { teamData: any; competition: any }>();
  
  // Extract unique teams from matches WITH THEIR API DATA
  matches.forEach((match) => {
  
    
    if (match.homeTeam?.name) {
      uniqueTeams.set(match.homeTeam.name, {
        teamData: match.homeTeam,
        competition: match.competition
      });
    }
    
    if (match.awayTeam?.name) {
      uniqueTeams.set(match.awayTeam.name, {
        teamData: match.awayTeam,
        competition: match.competition
      });
    }
  });
  
 
  
  if (uniqueTeams.size === 0) {
   
    return [];
  }
  
  // Get existing teams once
  const existingTeams = await getTeams();
 
  
  // Register each team that doesn't exist
  for (const [teamName, { teamData, competition }] of uniqueTeams.entries()) {
    try {
      // Check if team already exists
      const exists = existingTeams.find(t => t.name === teamName);
      
      if (exists) {
      
        registeredTeams.push(exists);
      } else {
       
        
        // Create team data USING API TEAM DATA
        const teamToRegister = createTeamData(teamData, competition);
        
        // Add the team to database
        const newTeam = await addTeam(teamToRegister);
        
        if (newTeam) {
         
          registeredTeams.push(newTeam);
        } else {
         
        }
      }
    } catch (error) {
     
    }
  }
  
  
  return registeredTeams;
}

// GET OR CREATE TEAM USING API DATA
export async function getOrCreateTeam(
  teamData: any, 
  competition: any
): Promise<number> {
  const teamName = teamData.name;
  
  try {
    
    
    // Check if team exists
    const existingTeams = await getTeams();
    const existingTeam = existingTeams.find(t => t.name === teamName);
    
    if (existingTeam) {
     
      return existingTeam.id;
    }
    
    // Team doesn't exist, create it WITH API DATA
   
    const teamToRegister = createTeamData(teamData, competition);
    
    const newTeam = await addTeam(teamToRegister);
    
    if (newTeam) {
      
      return newTeam.id;
    } else {
    
      return -1;
    }
    
  } catch (error) {
   
    return -1;
  }
}