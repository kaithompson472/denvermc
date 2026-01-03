import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';
import {
  COLORADO_LOCATIONS,
  getLocationBySlug,
  getAllLocationSlugs,
  type Location,
} from '@/lib/data/locations';

interface CityPageProps {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return getAllLocationSlugs().map((city) => ({ city }));
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city } = await params;
  const location = getLocationBySlug(city);

  if (!location) {
    return {
      title: 'City Not Found | Denver MeshCore',
    };
  }

  const title = `${location.name} Mesh Network | MeshCore Coverage in ${location.name}, Colorado`;
  const description = `Join the ${location.name} mesh network community. ${location.description} Find local MeshCore nodes, coverage information, and how to get started with off-grid communication in ${location.name}.`;

  return {
    title,
    description,
    keywords: [
      `${location.name} mesh network`,
      `${location.name} MeshCore`,
      `${location.name} LoRa network`,
      `${location.name} off-grid communication`,
      `${location.name} emergency communication`,
      `${location.region} mesh network`,
      'Colorado mesh network',
      'Meshtastic Colorado',
      'MeshCore nodes',
    ],
    alternates: {
      canonical: `/locations/${location.slug}`,
    },
    openGraph: {
      title: `${location.name} Mesh Network | Denver MeshCore`,
      description: location.description,
      url: `https://denvermc.com/locations/${location.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${location.name} Mesh Network | Denver MeshCore`,
      description: location.description,
    },
  };
}

function getCoverageLabel(coverage: Location['meshCoverage']): string {
  switch (coverage) {
    case 'excellent':
      return 'Excellent Coverage';
    case 'good':
      return 'Good Coverage';
    case 'growing':
      return 'Growing Network';
    case 'planned':
      return 'Coming Soon';
    default:
      return 'Coverage Status';
  }
}

function getCoverageBadgeColor(coverage: Location['meshCoverage']): string {
  switch (coverage) {
    case 'excellent':
      return 'bg-forest-500/10 text-forest-500 border-forest-500/30';
    case 'good':
      return 'bg-mesh/10 text-mesh border-mesh/30';
    case 'growing':
      return 'bg-sunset-500/10 text-sunset-500 border-sunset-500/30';
    case 'planned':
      return 'bg-foreground-muted/10 text-foreground-muted border-foreground-muted/30';
    default:
      return 'bg-foreground-muted/10 text-foreground-muted border-foreground-muted/30';
  }
}

function getCoverageDescription(coverage: Location['meshCoverage'], name: string): string {
  switch (coverage) {
    case 'excellent':
      return `${name} has excellent mesh network coverage with dense node distribution across the city. Most areas have reliable connectivity with multiple routing paths.`;
    case 'good':
      return `${name} has good mesh network coverage with nodes distributed throughout key areas. Coverage continues to expand with new nodes being added regularly.`;
    case 'growing':
      return `The mesh network in ${name} is actively growing. Early adopters are establishing the initial node infrastructure, and coverage is expanding rapidly.`;
    case 'planned':
      return `Mesh network coverage in ${name} is planned for the near future. Be among the first to establish nodes and help build the local network.`;
    default:
      return `Mesh network coverage information for ${name}.`;
  }
}

const USE_CASES = [
  {
    title: 'Emergency Preparedness',
    description:
      'Stay connected during power outages, natural disasters, and emergencies when traditional communication fails.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    ),
  },
  {
    title: 'Outdoor Adventures',
    description:
      'Keep in touch on hikes, ski trips, and backcountry adventures where cell service is unavailable.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    ),
  },
  {
    title: 'Community Connection',
    description:
      'Build a resilient local communication network that brings neighbors together and strengthens community ties.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    ),
  },
];

export default async function CityPage({ params }: CityPageProps) {
  const { city } = await params;
  const location = getLocationBySlug(city);

  if (!location) {
    notFound();
  }

  const breadcrumbData = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://denvermc.com' },
    { name: 'Locations', url: 'https://denvermc.com/locations' },
    { name: location.name, url: `https://denvermc.com/locations/${location.slug}` },
  ]);

  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: `${location.name} Mesh Network`,
    description: location.description,
    url: `https://denvermc.com/locations/${location.slug}`,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: location.coordinates.lat,
      longitude: location.coordinates.lng,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: location.name,
      addressRegion: location.stateCode,
      addressCountry: location.countryCode,
    },
    containedInPlace: {
      '@type': 'State',
      name: location.state,
    },
  };

  // Find nearby cities for cross-linking
  const nearbyCities = COLORADO_LOCATIONS.filter((loc) => loc.slug !== location.slug).slice(0, 3);

  return (
    <>
      <JsonLd data={breadcrumbData} />
      <JsonLd data={pageSchema} />
      <div className="min-h-screen bg-mesh">
        {/* Hero Section */}
        <section className="px-6 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <nav className="mb-8">
              <ol className="flex items-center justify-center gap-2 text-sm text-foreground-muted">
                <li>
                  <Link href="/" className="hover:text-mesh">
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/locations" className="hover:text-mesh">
                    Locations
                  </Link>
                </li>
                <li>/</li>
                <li className="text-foreground">{location.name}</li>
              </ol>
            </nav>

            <span
              className={`inline-block px-3 py-1 text-sm font-medium rounded-full border mb-4 ${getCoverageBadgeColor(location.meshCoverage)}`}
            >
              {getCoverageLabel(location.meshCoverage)}
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              <span className="text-mesh">{location.name}</span> Mesh Network
            </h1>

            <p className="text-xl md:text-2xl text-foreground-muted mb-4 max-w-3xl mx-auto">
              {location.shortDescription}
            </p>

            <p className="text-lg text-foreground-muted mb-8 max-w-2xl mx-auto">
              {location.description}
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/start" className="btn-primary">
                Join the Network
              </Link>
              <Link href="/map" className="btn-outline">
                View Network Map
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="px-6 py-12 bg-background-secondary">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="card-mesh p-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-mesh mb-1">
                  {location.elevation?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-sm text-foreground-muted">Elevation (ft)</div>
              </div>
              <div className="card-mesh p-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-forest-500 mb-1">
                  {location.population
                    ? `${(location.population / 1000).toFixed(0)}k`
                    : 'N/A'}
                </div>
                <div className="text-sm text-foreground-muted">Population</div>
              </div>
              <div className="card-mesh p-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-mountain-500 mb-1">
                  {location.region}
                </div>
                <div className="text-sm text-foreground-muted">Region</div>
              </div>
              <div className="card-mesh p-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-sunset-500 mb-1">
                  {getCoverageLabel(location.meshCoverage)}
                </div>
                <div className="text-sm text-foreground-muted">Coverage Status</div>
              </div>
            </div>
          </div>
        </section>

        {/* Coverage Information */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  Coverage in {location.name}
                </h2>
                <div className="space-y-4 text-foreground-muted">
                  <p>{getCoverageDescription(location.meshCoverage, location.name)}</p>
                  <p>
                    The <strong>{location.name} mesh network</strong> is part of the larger Colorado
                    Front Range mesh network, connecting communities from Fort Collins to Colorado
                    Springs. This interconnected system provides redundant communication paths and
                    extends coverage across the region.
                  </p>
                  {location.areaInfo && (
                    <p>
                      Located in the <strong>{location.areaInfo}</strong>, {location.name} benefits
                      from Colorado&apos;s unique geography for long-range mesh communication.
                    </p>
                  )}
                </div>
              </div>
              <div className="card-mesh p-8">
                <h3 className="text-xl font-bold text-foreground mb-4">How to Help Expand Coverage</h3>
                <ul className="space-y-3 text-foreground-muted">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-mesh/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-mesh font-bold text-sm">1</span>
                    </span>
                    <span>Get a MeshCore-compatible device and join the network</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-mesh/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-mesh font-bold text-sm">2</span>
                    </span>
                    <span>Set up a node at home, especially if you have elevation advantage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-mesh/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-mesh font-bold text-sm">3</span>
                    </span>
                    <span>Consider adding a solar-powered repeater for 24/7 coverage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-mesh/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-mesh font-bold text-sm">4</span>
                    </span>
                    <span>Share with neighbors to grow the local community</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="px-6 py-16 bg-background-secondary">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground text-center">
              Why {location.name} Needs a Mesh Network
            </h2>
            <p className="text-foreground-muted text-center mb-12 max-w-2xl mx-auto">
              From emergency preparedness to outdoor adventures, a mesh network serves the{' '}
              {location.name} community in many ways.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {USE_CASES.map((useCase) => (
                <div key={useCase.title} className="card-mesh p-8 text-center">
                  <div className="w-16 h-16 bg-mesh/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <svg
                      className="w-8 h-8 text-mesh"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {useCase.icon}
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{useCase.title}</h3>
                  <p className="text-foreground-muted">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nearby Cities */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground text-center">
              Nearby Mesh Networks
            </h2>
            <p className="text-foreground-muted text-center mb-12 max-w-2xl mx-auto">
              The {location.name} mesh network connects with these nearby Colorado communities.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {nearbyCities.map((nearbyCity) => (
                <Link
                  key={nearbyCity.slug}
                  href={`/locations/${nearbyCity.slug}`}
                  className="card-mesh p-6 hover:border-mesh transition-all group"
                >
                  <h3 className="text-xl font-bold text-foreground group-hover:text-mesh transition-colors mb-2">
                    {nearbyCity.name}
                  </h3>
                  <p className="text-sm text-foreground-muted mb-4">{nearbyCity.shortDescription}</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getCoverageBadgeColor(nearbyCity.meshCoverage)}`}
                  >
                    {getCoverageLabel(nearbyCity.meshCoverage)}
                  </span>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/locations" className="text-mesh hover:underline inline-flex items-center gap-2">
                View all Colorado locations
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16 bg-night-stars text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join the {location.name} Mesh Network
            </h2>
            <p className="text-mountain-100 mb-8 text-lg">
              Help build resilient, off-grid communication infrastructure in {location.name}. Every
              new node strengthens the network and extends coverage to more neighbors.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/start" className="btn-accent">
                Get Started
              </Link>
              <a
                href="https://discord.gg/QpaW8FTTCE"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline border-white text-white hover:bg-white hover:text-night-950"
              >
                Join Discord
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
