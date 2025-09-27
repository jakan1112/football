// components/ViewerPanel.tsx
import { useState } from 'react';
import MatchListView from './matchlistview';
import MatchDetailView from './matchdetailview';
import { Match, Team } from '../types';

interface ViewerPanelProps {
  teams: Team[];
  matches: Match[];
}

export default function ViewerPanel({ teams, matches }: ViewerPanelProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  const selectedMatch = matches.find(match => match.id === selectedMatchId);

  if (selectedMatch) {
    return (
      <MatchDetailView
        match={selectedMatch}
        homeTeam={teams.find(team => team.id === selectedMatch.homeTeamId)}
        awayTeam={teams.find(team => team.id === selectedMatch.awayTeamId)}
        onBack={() => setSelectedMatchId(null)}
      />
    );
  }

  return (
    <MatchListView
      matches={matches}
      teams={teams}
      onMatchSelect={setSelectedMatchId}
    />
  );
}