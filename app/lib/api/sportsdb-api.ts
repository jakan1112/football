// lib/api/sportsdb-api.ts
"use server";

export interface APIMatch {
  id: string;
  utcDate: string;
  status: string;
  matchday: number;
  homeTeam: {
    id: number;
    name: string;
    crest?: string;
  };
  awayTeam: {
    id: number;
    name: string;
    crest?: string;
  };
  competition: {
    name: string;
  };
  score?: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
}

const LEAGUES = [
  { name: "Premier League", code: "PL" },
  { name: "La Liga", code: "PD" },
  { name: "Serie A", code: "SA" },
  { name: "Bundesliga", code: "BL1" },
  { name: "Ligue 1", code: "FL1" },
  { name: "Champions League", code: "CL" },
];

export async function fetchFootballMatches(): Promise<APIMatch[]> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY!;
  let allMatches: APIMatch[] = [];

  for (const league of LEAGUES) {
    try {
      const res = await fetch(`https://api.football-data.org/v4/competitions/${league.code}/matches`, {
        headers: { 'X-Auth-Token': apiKey },
        next: { revalidate: 3600 },
      });
      
      if (!res.ok) {
        console.log(`❌ ${league.name}: ${res.status}`);
        continue;
      }

      const data = await res.json();
      const matches = data.matches || [];
      
      console.log(`✅ ${league.name}: ${matches.length} matches loaded`);
      allMatches = allMatches.concat(matches);
      
    } catch (error) {
      console.error(`💥 Error fetching ${league.name}:`, error);
      continue;
    }
  }

  console.log(`📊 Total matches fetched: ${allMatches.length}`);
  return allMatches;
}

export async function getAvailableLeagues(matches: APIMatch[]): string[] {
  const leagues = Array.from(new Set(matches.map((m) => m.competition.name))).sort();
  return leagues;
}