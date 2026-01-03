import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

/**
 * Blog post frontmatter interface
 */
export interface BlogPostFrontmatter {
  title: string;
  description: string;
  date: string;
  author: string;
  authorUrl?: string;
  image?: string;
  imageAlt?: string;
  tags?: string[];
  published?: boolean;
}

/**
 * Full blog post with content and computed fields
 */
export interface BlogPost {
  slug: string;
  frontmatter: BlogPostFrontmatter;
  content: string;
  readingTime: string;
  wordCount: number;
}

/**
 * Blog post metadata (without content, for listing pages)
 */
export interface BlogPostMeta {
  slug: string;
  frontmatter: BlogPostFrontmatter;
  readingTime: string;
}

// Posts directory path
const POSTS_DIRECTORY = path.join(process.cwd(), 'content/blog');

/**
 * Validate frontmatter has required fields
 * Returns validated frontmatter or null if invalid
 */
function validateFrontmatter(
  data: Record<string, unknown>,
  slug: string
): BlogPostFrontmatter | null {
  const requiredFields = ['title', 'description', 'date', 'author'] as const;
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (typeof data[field] !== 'string' || data[field] === '') {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    console.warn(
      `Blog post "${slug}" is missing required frontmatter fields: ${missingFields.join(', ')}`
    );
    return null;
  }

  // Validate date format
  const dateValue = data.date as string;
  const parsedDate = new Date(dateValue);
  if (isNaN(parsedDate.getTime())) {
    console.warn(
      `Blog post "${slug}" has invalid date format: "${dateValue}"`
    );
    return null;
  }

  // Validate optional fields types
  if (data.tags !== undefined && !Array.isArray(data.tags)) {
    console.warn(
      `Blog post "${slug}" has invalid tags (expected array): ${typeof data.tags}`
    );
    data.tags = undefined;
  }

  if (data.published !== undefined && typeof data.published !== 'boolean') {
    console.warn(
      `Blog post "${slug}" has invalid published value (expected boolean): ${typeof data.published}`
    );
    data.published = undefined;
  }

  return {
    title: data.title as string,
    description: data.description as string,
    date: data.date as string,
    author: data.author as string,
    authorUrl: typeof data.authorUrl === 'string' ? data.authorUrl : undefined,
    image: typeof data.image === 'string' ? data.image : undefined,
    imageAlt: typeof data.imageAlt === 'string' ? data.imageAlt : undefined,
    tags: Array.isArray(data.tags)
      ? data.tags.filter((t): t is string => typeof t === 'string')
      : undefined,
    published:
      typeof data.published === 'boolean' ? data.published : undefined,
  };
}

/**
 * Get all blog post slugs from the content directory
 */
export function getPostSlugs(): string[] {
  try {
    if (!fs.existsSync(POSTS_DIRECTORY)) {
      return [];
    }
    return fs
      .readdirSync(POSTS_DIRECTORY)
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => file.replace(/\.mdx$/, ''));
  } catch {
    return [];
  }
}

/**
 * Get a single blog post by slug
 */
export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const filePath = path.join(POSTS_DIRECTORY, `${slug}.mdx`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const stats = readingTime(content);

    // Validate frontmatter before type assertion
    const frontmatter = validateFrontmatter(
      data as Record<string, unknown>,
      slug
    );
    if (!frontmatter) {
      return null;
    }

    return {
      slug,
      frontmatter,
      content,
      readingTime: stats.text,
      wordCount: stats.words,
    };
  } catch {
    return null;
  }
}

/**
 * Get all blog posts, sorted by date (newest first)
 * Only includes published posts unless includeUnpublished is true
 */
export function getAllPosts(includeUnpublished = false): BlogPostMeta[] {
  const slugs = getPostSlugs();

  const posts = slugs
    .map((slug) => {
      const post = getPostBySlug(slug);
      if (!post) return null;

      // Filter out unpublished posts unless explicitly requested
      if (!includeUnpublished && post.frontmatter.published === false) {
        return null;
      }

      return {
        slug: post.slug,
        frontmatter: post.frontmatter,
        readingTime: post.readingTime,
      } as BlogPostMeta;
    })
    .filter((post): post is BlogPostMeta => post !== null);

  // Sort by date, newest first
  return posts.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date);
    const dateB = new Date(b.frontmatter.date);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Get posts filtered by tag
 */
export function getPostsByTag(tag: string): BlogPostMeta[] {
  return getAllPosts().filter((post) =>
    post.frontmatter.tags?.some(
      (t) => t.toLowerCase() === tag.toLowerCase()
    )
  );
}

/**
 * Get all unique tags from all posts
 */
export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tagSet = new Set<string>();

  posts.forEach((post) => {
    post.frontmatter.tags?.forEach((tag) => {
      tagSet.add(tag.toLowerCase());
    });
  });

  return Array.from(tagSet).sort();
}

/**
 * Get related posts based on shared tags
 */
export function getRelatedPosts(currentSlug: string, limit = 3): BlogPostMeta[] {
  const currentPost = getPostBySlug(currentSlug);
  if (!currentPost || !currentPost.frontmatter.tags?.length) {
    return [];
  }

  const allPosts = getAllPosts();
  const currentTags = new Set(
    currentPost.frontmatter.tags.map((t) => t.toLowerCase())
  );

  // Score posts by number of shared tags
  const scoredPosts = allPosts
    .filter((post) => post.slug !== currentSlug)
    .map((post) => {
      const sharedTags = post.frontmatter.tags?.filter((tag) =>
        currentTags.has(tag.toLowerCase())
      ).length ?? 0;
      return { post, sharedTags };
    })
    .filter(({ sharedTags }) => sharedTags > 0)
    .sort((a, b) => b.sharedTags - a.sharedTags);

  return scoredPosts.slice(0, limit).map(({ post }) => post);
}
