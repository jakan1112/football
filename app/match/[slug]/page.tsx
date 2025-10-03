// app/match/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MatchDetailPage from '../../components/matchdetailview';
import { getMatchBySlug, getMatches } from '../../lib/supabase-service';

interface MatchPageProps {
  params: {
    slug: string;
  };
}


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
    const match = await getMatchBySlug(params.slug);
    
    if (!match) {
      return {
        title: 'Match Not Found',
      };
    }

    const homeTeamName = 'Home Team'; // You'll need to get this from your data
    const awayTeamName = 'Away Team'; // You'll need to get this from your data

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
  const match = await getMatchBySlug(params.slug);
  
  if (!match) {
    notFound();
  }

  return <MatchDetailPage match={match} />;
}