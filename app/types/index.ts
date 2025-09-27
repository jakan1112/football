// types/index.ts
export interface Team {
  id: number;
  name: string;
  logo: string;
  country: string;
}

export interface Match {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  date: string;
  time: string;
  streamEmbed: string;
  status: 'upcoming' | 'live' | 'finished';
  homeScore: number;
  awayScore: number;
  lineups: {
    home: string[];
    away: string[];
  };
  blogPosts: BlogPost[];
  league?: string;
}

export interface BlogPost {
  id: number;
  timestamp: string;
  content: string;
  type: 'goal' | 'card' | 'substitution' | 'general';
  team?: 'home' | 'away';
  player?: string;
}

export interface TeamFormData {
  name: string;
  logo: string;
  country: string;
}

export interface MatchFormData {
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  time: string;
  streamEmbed: string;
  league?: string;
}