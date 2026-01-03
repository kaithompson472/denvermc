import { MetadataRoute } from 'next';
import { COLORADO_LOCATIONS } from '@/lib/data/locations';
import { getPostSlugs } from '@/lib/blog';

const BASE_URL = 'https://denvermc.com';

// Static use case slugs (these are static pages in the app)
const USE_CASE_SLUGS = [
  'emergency-communication',
  'off-grid-communication',
  'community-networks',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  // Core static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/start`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/why-meshcore`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/map`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/observer`,
      lastModified,
      changeFrequency: 'hourly',
      priority: 0.6,
    },
  ];

  // Locations index page
  const locationsIndex: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/locations`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
  ];

  // Dynamic location pages
  const locationPages: MetadataRoute.Sitemap = COLORADO_LOCATIONS.map(
    (location) => ({
      url: `${BASE_URL}/locations/${location.slug}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })
  );

  // Use case pages
  const useCasePages: MetadataRoute.Sitemap = USE_CASE_SLUGS.map((slug) => ({
    url: `${BASE_URL}/use-cases/${slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Blog index page
  const blogIndex: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/blog`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
  ];

  // Dynamic blog post pages
  const blogSlugs = getPostSlugs();
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...locationsIndex,
    ...locationPages,
    ...useCasePages,
    ...blogIndex,
    ...blogPages,
  ];
}
