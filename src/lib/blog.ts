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

    return {
      slug,
      frontmatter: data as BlogPostFrontmatter,
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
