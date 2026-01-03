import fs from 'fs';
import path from 'path';
import { MetadataRoute } from 'next';
import { getPostSlugs } from '@/lib/blog';
import { BASE_URL } from '@/lib/constants';

/**
 * Auto-discover use case slugs from the use-cases directory
 */
function getUseCaseSlugs(): string[] {
  const useCasesDir = path.join(process.cwd(), 'src/app/use-cases');

  try {
    if (!fs.existsSync(useCasesDir)) {
      return [];
    }

    return fs
      .readdirSync(useCasesDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
  } catch {
    return [];
  }
}

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

  // Use case pages (auto-discovered from file system)
  const useCaseSlugs = getUseCaseSlugs();
  const useCasePages: MetadataRoute.Sitemap = useCaseSlugs.map((slug) => ({
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
    ...useCasePages,
    ...blogIndex,
    ...blogPages,
  ];
}
