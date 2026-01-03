import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllTags } from '@/lib/blog';
import JsonLd from '@/components/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';

export const metadata: Metadata = {
  title: {
    default: 'Blog',
    template: '%s | Denver MeshCore Blog',
  },
  description:
    'News, tutorials, and updates from the Denver MeshCore community. Learn about mesh networking, LoRa technology, off-grid communication, and building resilient networks in Colorado.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Denver MeshCore Blog',
    description:
      'News, tutorials, and updates from the Denver MeshCore community. Learn about mesh networking and off-grid communication.',
    url: 'https://denvermc.com/blog',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Denver MeshCore Blog',
    description:
      'News, tutorials, and updates from the Denver MeshCore community.',
  },
};

const breadcrumbData = generateBreadcrumbSchema([
  { name: 'Home', url: 'https://denvermc.com' },
  { name: 'Blog', url: 'https://denvermc.com/blog' },
]);

interface BlogLayoutProps {
  children: React.ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  const tags = getAllTags();

  return (
    <>
      <JsonLd data={breadcrumbData} />
      <div className="min-h-screen bg-mesh">
        {/* Blog Header */}
        <section className="px-6 py-12 md:py-16 text-center border-b border-card-border">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Denver MeshCore Blog
            </h1>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
              News, tutorials, and updates from the Denver mesh networking community.
              Learn about LoRa technology, off-grid communication, and building resilient networks.
            </p>
          </div>
        </section>

        {/* Main Content with Sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Main Content */}
            <main className="lg:col-span-8">{children}</main>

            {/* Sidebar */}
            <aside className="hidden lg:block lg:col-span-4">
              <div className="sticky top-24 space-y-8">
                {/* About Section */}
                <div className="card-mesh p-6">
                  <h2 className="text-lg font-bold text-foreground mb-3">
                    About the Blog
                  </h2>
                  <p className="text-sm text-foreground-muted mb-4">
                    Stay updated with the latest news from Denver MeshCore. We share
                    tutorials, network updates, and community stories.
                  </p>
                  <Link
                    href="/about"
                    className="text-mesh hover:text-mesh-light text-sm font-medium inline-flex items-center gap-1"
                  >
                    Learn more about us
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>

                {/* Tags Section */}
                {tags.length > 0 && (
                  <div className="card-mesh p-6">
                    <h2 className="text-lg font-bold text-foreground mb-4">
                      Topics
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/blog?tag=${encodeURIComponent(tag)}`}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-mountain-100 text-mountain-700 hover:bg-mountain-200 dark:bg-night-700 dark:text-mountain-300 dark:hover:bg-night-600 transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Newsletter CTA */}
                <div className="card-mesh p-6 bg-mesh-gradient text-white">
                  <h2 className="text-lg font-bold mb-3">Join Our Community</h2>
                  <p className="text-sm text-mesh-light mb-4">
                    Connect with the Denver MeshCore community on Discord for
                    real-time updates and discussions.
                  </p>
                  <a
                    href="https://discord.gg/QpaW8FTTCE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-mesh rounded-md font-medium text-sm hover:bg-mountain-50 transition-colors"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                    Join Discord
                  </a>
                </div>

                {/* Quick Links */}
                <div className="card-mesh p-6">
                  <h2 className="text-lg font-bold text-foreground mb-4">
                    Quick Links
                  </h2>
                  <nav className="space-y-2">
                    <Link
                      href="/start"
                      className="flex items-center gap-2 text-sm text-foreground-muted hover:text-mesh transition-colors"
                    >
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
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Get Started Guide
                    </Link>
                    <Link
                      href="/map"
                      className="flex items-center gap-2 text-sm text-foreground-muted hover:text-mesh transition-colors"
                    >
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
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                      </svg>
                      Network Map
                    </Link>
                    <Link
                      href="/observer"
                      className="flex items-center gap-2 text-sm text-foreground-muted hover:text-mesh transition-colors"
                    >
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
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      Network Analyzers
                    </Link>
                    <Link
                      href="/why-meshcore"
                      className="flex items-center gap-2 text-sm text-foreground-muted hover:text-mesh transition-colors"
                    >
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
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Why MeshCore?
                    </Link>
                  </nav>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
