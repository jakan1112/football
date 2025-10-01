// lib/seo.ts
import { Team, Match } from '../types';

// Generate SEO data for different pages
export function generateHomeSEO() {
  const title = "Free Football Live Stream - Watch Live Matches Online";
  const description = "Watch free live football streams. Champions League, Premier League, La Liga, Serie A matches with real-time scores and live commentary.";
  
  return {
    title,
    description,
    keywords: "free football live stream, watch football online, live soccer, premier league live, champions league stream",
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Free Football Live Stream'
    }
  };
}

export function generateMatchSEO(match: Match, homeTeam: Team, awayTeam: Team) {
  const matchTitle = `${homeTeam.name} vs ${awayTeam.name} Live Stream - ${match.date}`;
  const matchDescription = `Watch ${homeTeam.name} vs ${awayTeam.name} live online free. Match starts at ${match.time}. Live scores, lineups, and real-time updates.`;
  
  return {
    title: matchTitle,
    description: matchDescription,
    keywords: `${homeTeam.name} vs ${awayTeam.name} live, ${homeTeam.name} ${awayTeam.name} stream, watch ${homeTeam.name} ${awayTeam.name} free`,
    openGraph: {
      title: matchTitle,
      description: matchDescription,
      type: 'article',
      publishedTime: match.date
    }
  };
}

export function generateLeagueSEO(league: string) {
  const title = `${league} Live Stream - Free ${league} Matches`;
  const description = `Watch free ${league} live streams. All matches with live scores, team lineups, and real-time commentary.`;
  
  return {
    title,
    description,
    keywords: `${league} live stream, ${league} free, watch ${league} online, ${league} matches`
  };
}