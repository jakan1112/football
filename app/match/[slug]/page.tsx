// app/match/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MatchDetailPage from '../../components/matchdetailview';
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
    
    // Filter only matches with valid slugs
    const validParams = matches
      .filter(match => match.slug && typeof match.slug === 'string')
      .map((match) => ({
        slug: match.slug,
      }));

    console.log('Generated static params for matches:', validParams.length);
    return validParams;
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// This generates SEO meta tags for each match
export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  try {
    const { slug } = await params; // ✅ AWAIT params
    
    if (!slug) {
      return {
        title: 'Match Not Found',
      };
    }

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
    console.error('Error generating metadata:', error);
    return {
      title: 'Match Not Found',
    };
  }
}

export default async function MatchPage({ params }: MatchPageProps) {
  try {
    const { slug } = await params; // ✅ AWAIT params
    
    if (!slug) {
      console.log('No slug provided');
      notFound();
    }

    const match = await getMatchBySlug(slug);
    
    if (!match) {
      console.log(`Match not found for slug: ${slug}`);
      notFound();
    }

    return <MatchDetailPage match={match} />;
  } catch (error) {
    console.error('Error loading match page:', error);
    notFound();
  }
}