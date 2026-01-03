import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';
import { COLORADO_LOCATIONS } from '@/lib/data/locations';
import { getCoverageLabel, getCoverageBadgeColor, getCoverageColor } from '@/lib/utils/coverage';

export const metadata: Metadata = {
  title: 'Colorado Mesh Network Coverage | Front Range Cities',
  description:
    'Explore Colorado mesh network coverage across the Front Range. Find MeshCore nodes in Denver, Boulder, Colorado Springs, Fort Collins, Golden, and other Front Range cities. Join your local mesh network community.',
  keywords: [
    'Colorado mesh network',
    'Front Range mesh network',
    'Denver mesh network',
    'Boulder mesh network',
    'Colorado Springs mesh network',
    'Fort Collins mesh network',
    'Colorado LoRa network',
    'Front Range LoRa coverage',
    'Colorado off-grid communication',
    'Front Range emergency communication',
    'Colorado MeshCore',
    'Front Range MeshCore nodes',
  ],
  alternates: {
    canonical: '/locations',
  },
  openGraph: {
    title: 'Colorado Mesh Network Coverage | Denver MeshCore',
    description:
      'Explore MeshCore coverage across the Colorado Front Range. Find nodes in Denver, Boulder, Colorado Springs, and more.',
    url: 'https://denvermc.com/locations',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Colorado Mesh Network Coverage | Denver MeshCore',
    description:
      'Explore MeshCore coverage across the Colorado Front Range. Find nodes in Denver, Boulder, Colorado Springs, and more.',
  },
};

const breadcrumbData = generateBreadcrumbSchema([
  { name: 'Home', url: 'https://denvermc.com' },
  { name: 'Locations', url: 'https://denvermc.com/locations' },
]);

const pageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Colorado Mesh Network Coverage',
  description:
    'Explore Colorado mesh network coverage across the Front Range. Find MeshCore nodes in Denver, Boulder, Colorado Springs, and other Front Range cities.',
  url: 'https://denvermc.com/locations',
  publisher: {
    '@type': 'Organization',
    name: 'Denver MeshCore',
    url: 'https://denvermc.com',
  },
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: COLORADO_LOCATIONS.map((location, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${location.name} Mesh Network`,
      url: `https://denvermc.com/locations/${location.slug}`,
    })),
  },
};

export default function LocationsPage() {
  // Group locations by coverage level for display
  const excellentCoverage = COLORADO_LOCATIONS.filter((l) => l.meshCoverage === 'excellent');
  const goodCoverage = COLORADO_LOCATIONS.filter((l) => l.meshCoverage === 'good');
  const growingCoverage = COLORADO_LOCATIONS.filter((l) => l.meshCoverage === 'growing');

  return (
    <>
      <JsonLd data={breadcrumbData} />
      <JsonLd data={pageSchema} />
      <div className="min-h-screen bg-mesh">
        {/* Hero Section */}
        <section className="px-6 py-16 md:py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              <span className="text-mesh">Colorado</span> Mesh Network Coverage
            </h1>
            <p className="text-xl md:text-2xl text-foreground-muted mb-4 max-w-3xl mx-auto">
              Explore MeshCore coverage across the Front Range and beyond. Find nodes in your city
              and join your local mesh network community.
            </p>
            <p className="text-lg text-foreground-muted mb-8 max-w-2xl mx-auto">
              The Denver MeshCore network spans {COLORADO_LOCATIONS.length} cities across Colorado,
              providing resilient, off-grid communication infrastructure from the plains to the
              peaks.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/map" className="btn-primary">
                View Network Map
              </Link>
              <Link href="/start" className="btn-outline">
                Join the Network
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 py-12 bg-background-secondary">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="card-mesh p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold text-mesh mb-2">
                  {COLORADO_LOCATIONS.length}
                </div>
                <div className="text-sm text-foreground-muted">Cities Covered</div>
              </div>
              <div className="card-mesh p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold text-forest-500 mb-2">
                  {excellentCoverage.length + goodCoverage.length}
                </div>
                <div className="text-sm text-foreground-muted">Active Networks</div>
              </div>
              <div className="card-mesh p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold text-sunset-500 mb-2">
                  {growingCoverage.length}
                </div>
                <div className="text-sm text-foreground-muted">Growing Networks</div>
              </div>
              <div className="card-mesh p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold text-mountain-500 mb-2">200+</div>
                <div className="text-sm text-foreground-muted">Miles of Coverage</div>
              </div>
            </div>
          </div>
        </section>

        {/* Front Range Network Overview */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  The Front Range Mesh Network
                </h2>
                <div className="space-y-4 text-foreground-muted">
                  <p>
                    The <strong>Colorado mesh network</strong> spans the entire Front Range
                    corridor, from Fort Collins in the north to Colorado Springs in the south. This
                    interconnected network of MeshCore nodes provides off-grid communication
                    capability across one of the most populated regions in the Mountain West.
                  </p>
                  <p>
                    Our <strong>Front Range mesh network</strong> takes advantage of
                    Colorado&apos;s unique geography. Strategic placement of repeaters on mountain
                    peaks, foothills, and tall buildings creates a resilient communication backbone
                    that works when traditional infrastructure fails.
                  </p>
                  <p>
                    Whether you&apos;re in downtown Denver, hiking near Boulder, or living in a
                    mountain community, the Colorado mesh network keeps you connected to your
                    community and emergency services.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="card-mesh p-6">
                  <h3 className="font-bold text-foreground mb-2">North Zone</h3>
                  <p className="text-sm text-foreground-muted">
                    Fort Collins, Loveland, and the Northern Colorado corridor. Growing network with
                    strong university community involvement.
                  </p>
                </div>
                <div className="card-mesh p-6">
                  <h3 className="font-bold text-foreground mb-2">Central Zone</h3>
                  <p className="text-sm text-foreground-muted">
                    Denver, Boulder, Golden, and the metro area. Our densest coverage with the most
                    active nodes and repeaters.
                  </p>
                </div>
                <div className="card-mesh p-6">
                  <h3 className="font-bold text-foreground mb-2">South Zone</h3>
                  <p className="text-sm text-foreground-muted">
                    Colorado Springs and the Pikes Peak region. Expanding network with excellent
                    mountain-top repeater potential.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* City Grid */}
        <section className="px-6 py-16 bg-background-secondary">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground text-center">
              Find Your City
            </h2>
            <p className="text-foreground-muted text-center mb-12 max-w-2xl mx-auto">
              Explore mesh network coverage in cities across Colorado. Click on a city to learn more
              about local nodes, coverage areas, and how to get involved.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {COLORADO_LOCATIONS.map((location) => (
                <Link
                  key={location.slug}
                  href={`/locations/${location.slug}`}
                  className="card-mesh p-6 hover:border-mesh transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-mesh transition-colors">
                        {location.name}
                      </h3>
                      <p className="text-sm text-foreground-muted">{location.region}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getCoverageBadgeColor(location.meshCoverage)}`}
                    >
                      {getCoverageLabel(location.meshCoverage)}
                    </span>
                  </div>

                  <p className="text-foreground-muted text-sm mb-4">{location.shortDescription}</p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-foreground-muted">
                      {location.elevation && (
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 10l7-7m0 0l7 7m-7-7v18"
                            />
                          </svg>
                          {location.elevation.toLocaleString()}&apos;
                        </span>
                      )}
                      {location.population && (
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {(location.population / 1000).toFixed(0)}k
                        </span>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 ${getCoverageColor(location.meshCoverage)}`}
                    >
                      View Details
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why Colorado Section */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-foreground">
              Why Colorado Needs a Mesh Network
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-mesh p-8 text-center">
                <div className="w-16 h-16 bg-sunset-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg
                    className="w-8 h-8 text-sunset-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Wildfire Resilience</h3>
                <p className="text-foreground-muted">
                  Colorado&apos;s wildfire risk makes off-grid communication essential. When cell
                  towers fail or power goes out, the mesh network keeps communities connected.
                </p>
              </div>
              <div className="card-mesh p-8 text-center">
                <div className="w-16 h-16 bg-mountain-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg
                    className="w-8 h-8 text-mountain-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Winter Storm Ready</h3>
                <p className="text-foreground-muted">
                  Blizzards can knock out power for days. Solar-powered mesh nodes with battery
                  backup keep the Front Range connected through any storm.
                </p>
              </div>
              <div className="card-mesh p-8 text-center">
                <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg
                    className="w-8 h-8 text-forest-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Mountain Coverage</h3>
                <p className="text-foreground-muted">
                  Colorado&apos;s peaks provide ideal locations for repeaters that can reach dozens
                  of miles, connecting hikers, skiers, and mountain communities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Coverage Legend */}
        <section className="px-6 py-12 bg-background-secondary">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-foreground text-center mb-6">
              Understanding Coverage Levels
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-forest-500"></span>
                <div>
                  <div className="font-medium text-foreground">Excellent</div>
                  <div className="text-xs text-foreground-muted">Dense node coverage</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-mesh"></span>
                <div>
                  <div className="font-medium text-foreground">Good</div>
                  <div className="text-xs text-foreground-muted">Reliable coverage</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-sunset-500"></span>
                <div>
                  <div className="font-medium text-foreground">Growing</div>
                  <div className="text-xs text-foreground-muted">Expanding network</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-foreground-muted"></span>
                <div>
                  <div className="font-medium text-foreground">Planned</div>
                  <div className="text-xs text-foreground-muted">Coming soon</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16 bg-night-stars text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Help Expand the Colorado Mesh Network
            </h2>
            <p className="text-mountain-100 mb-8 text-lg">
              Every new node strengthens the Front Range mesh network. Whether you&apos;re in a city
              with excellent coverage or a town where we&apos;re just getting started, your
              participation matters.
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
