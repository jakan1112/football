// app/match/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MatchDetailView from '../../components/matchdetailview';
import { getMatchBySlug, getMatches } from '../../lib/supabase-service';

interface MatchPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// This tells Next.js which pages to pre-generate
export async function generateStaticParams() {
  try {
    const matches = await getMatches();
    
    return matches.map((match) => ({
      slug: match.slug,
    }));
  } catch (error) {
    return [];
  }
}

// This generates SEO meta tags for each match
export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const match = await getMatchBySlug(slug);
    
    if (!match) {
      return {
        title: 'Match Not Found',
      };
    }

    const homeTeamName = match.homeTeam?.name || 'Home Team';
    const awayTeamName = match.awayTeam?.name || 'Away Team';

    const title = `${homeTeamName} vs ${awayTeamName} Live Stream - ${match.date}`;
    const description = `Watch ${homeTeamName} vs ${awayTeamName} live stream free. Match starts at ${match.time}. Live scores and commentary.`;

    return {
      title,
      description,
      keywords: `${homeTeamName} vs ${awayTeamName} live, ${homeTeamName} ${awayTeamName} stream, watch ${homeTeamName} ${awayTeamName} free`,
      openGraph: {
        title,
        description,
        type: 'website',
      },
    };
  } catch (error) {
    return {
      title: 'Match Not Found',
    };
  }
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { slug } = await params;
  const match = await getMatchBySlug(slug);
  
  if (!match) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <MatchDetailView 
          match={match} 
          homeTeam={match.homeTeam} 
          awayTeam={match.awayTeam} 
        />
      </div>
    </div>
  );
}