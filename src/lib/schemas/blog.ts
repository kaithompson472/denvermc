import type { BlogPostFrontmatter } from '../blog';

interface BlogPostingSchemaOptions {
  slug: string;
  frontmatter: BlogPostFrontmatter;
  readingTime?: string;
  wordCount?: number;
  baseUrl?: string;
}

/**
 * Generate JSON-LD BlogPosting schema for SEO
 * @see https://schema.org/BlogPosting
 */
export function generateBlogPostingSchema({
  slug,
  frontmatter,
  readingTime,
  wordCount,
  baseUrl = 'https://denvermc.org',
}: BlogPostingSchemaOptions) {
  const postUrl = `${baseUrl}/blog/${slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: frontmatter.title,
    description: frontmatter.description,
    datePublished: frontmatter.date,
    dateModified: frontmatter.date,
    url: postUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    author: {
      '@type': 'Person',
      name: frontmatter.author,
      ...(frontmatter.authorUrl && { url: frontmatter.authorUrl }),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Denver MeshCore',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    ...(frontmatter.image && {
      image: {
        '@type': 'ImageObject',
        url: frontmatter.image.startsWith('http')
          ? frontmatter.image
          : `${baseUrl}${frontmatter.image}`,
        ...(frontmatter.imageAlt && { caption: frontmatter.imageAlt }),
      },
    }),
    ...(frontmatter.tags &&
      frontmatter.tags.length > 0 && {
        keywords: frontmatter.tags.join(', '),
      }),
    ...(wordCount && { wordCount }),
    ...(readingTime && {
      timeRequired: parseReadingTimeToISO(readingTime),
    }),
    inLanguage: 'en-US',
    isAccessibleForFree: true,
  };
}

/**
 * Generate JSON-LD Blog schema for the blog listing page
 * @see https://schema.org/Blog
 */
export function generateBlogSchema(baseUrl = 'https://denvermc.org') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Denver MeshCore Blog',
    description:
      'Guides, tutorials, and news about MeshCore mesh networking, LoRa communications, and the Denver mesh community.',
    url: `${baseUrl}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'Denver MeshCore',
      url: baseUrl,
    },
    inLanguage: 'en-US',
  };
}

/**
 * Generate Article schema variant (alternative to BlogPosting)
 * Use this for more technical/educational content
 */
export function generateArticleSchema({
  slug,
  frontmatter,
  readingTime,
  wordCount,
  baseUrl = 'https://denvermc.org',
}: BlogPostingSchemaOptions) {
  const schema = generateBlogPostingSchema({
    slug,
    frontmatter,
    readingTime,
    wordCount,
    baseUrl,
  });

  return {
    ...schema,
    '@type': 'Article',
    articleSection: 'Technology',
    articleBody: undefined, // Remove if present, typically too long
  };
}

/**
 * Convert reading time string to ISO 8601 duration
 * e.g., "5 min read" -> "PT5M"
 */
function parseReadingTimeToISO(readingTime: string): string {
  const match = readingTime.match(/(\d+)\s*min/i);
  if (match) {
    return `PT${match[1]}M`;
  }
  return 'PT5M'; // Default to 5 minutes
}

/**
 * Pre-configured blog categories for Denver MeshCore
 */
export const blogCategories = [
  {
    slug: 'tutorials',
    name: 'Tutorials',
    description: 'Step-by-step guides for MeshCore setup and configuration',
  },
  {
    slug: 'news',
    name: 'Community News',
    description: 'Updates from the Denver mesh community',
  },
  {
    slug: 'hardware',
    name: 'Hardware',
    description: 'Device reviews, comparisons, and hardware guides',
  },
  {
    slug: 'network',
    name: 'Network',
    description: 'Denver mesh network updates and coverage reports',
  },
  {
    slug: 'comparisons',
    name: 'Comparisons',
    description: 'MeshCore vs Meshtastic and other mesh solutions',
  },
];
