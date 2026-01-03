import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts, getAllTags, getPostsByTag, type BlogPostMeta } from '@/lib/blog';
import JsonLd from '@/components/JsonLd';
import { BASE_URL } from '@/lib/constants';

// Number of posts per page
const POSTS_PER_PAGE = 6;

interface BlogPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: BlogPageProps): Promise<Metadata> {
  const params = await searchParams;
  const tag = typeof params.tag === 'string' ? params.tag : undefined;

  if (tag) {
    return {
      title: `${tag} Posts`,
      description: `Blog posts about ${tag} from the Denver MeshCore community. Learn about mesh networking, LoRa technology, and off-grid communication.`,
      alternates: {
        canonical: `/blog?tag=${encodeURIComponent(tag)}`,
      },
    };
  }

  return {
    title: 'Blog',
    description:
      'News, tutorials, and updates from the Denver MeshCore community. Learn about mesh networking, LoRa technology, off-grid communication, and building resilient networks in Colorado.',
  };
}

// Generate blog list schema
function generateBlogListSchema(posts: BlogPostMeta[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Denver MeshCore Blog',
    description:
      'News, tutorials, and updates from the Denver MeshCore community',
    url: `${BASE_URL}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'Denver MeshCore',
      url: BASE_URL,
    },
    blogPost: posts.slice(0, 10).map((post) => ({
      '@type': 'BlogPosting',
      headline: post.frontmatter.title,
      description: post.frontmatter.description,
      datePublished: post.frontmatter.date,
      author: {
        '@type': 'Person',
        name: post.frontmatter.author,
      },
      url: `${BASE_URL}/blog/${post.slug}`,
    })),
  };
}

// Format date for display with error handling
function formatDate(dateString: string): string {
  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date string: "${dateString}"`);
    return 'Unknown date';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Blog post card component
function BlogPostCard({
  post,
  featured = false,
}: {
  post: BlogPostMeta;
  featured?: boolean;
}) {
  return (
    <article
      className={`card-mesh overflow-hidden group hover:border-mesh transition-colors ${
        featured ? 'md:col-span-2 lg:col-span-1' : ''
      }`}
    >
      {post.frontmatter.image && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={post.frontmatter.image}
            alt={post.frontmatter.imageAlt || post.frontmatter.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-6">
        {/* Tags */}
        {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.frontmatter.tags.slice(0, 2).map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag.toLowerCase())}`}
                className="text-xs px-2 py-1 rounded bg-mountain-100 text-mountain-700 hover:bg-mountain-200 dark:bg-night-700 dark:text-mountain-300 dark:hover:bg-night-600 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-mesh transition-colors">
          <Link href={`/blog/${post.slug}`}>{post.frontmatter.title}</Link>
        </h2>

        {/* Description */}
        <p className="text-foreground-muted text-sm mb-4 line-clamp-2">
          {post.frontmatter.description}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-foreground-muted">
          <div className="flex items-center gap-2">
            <span>{post.frontmatter.author}</span>
            <span>&bull;</span>
            <time dateTime={post.frontmatter.date}>
              {formatDate(post.frontmatter.date)}
            </time>
          </div>
          <span>{post.readingTime}</span>
        </div>
      </div>
    </article>
  );
}

// Featured post card (larger format)
function FeaturedPostCard({ post }: { post: BlogPostMeta }) {
  return (
    <article className="card-mesh overflow-hidden group hover:border-mesh transition-colors">
      <div className="md:flex">
        {post.frontmatter.image && (
          <div className="relative h-48 md:h-64 md:w-1/2 overflow-hidden flex-shrink-0">
            <Image
              src={post.frontmatter.image}
              alt={post.frontmatter.imageAlt || post.frontmatter.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-6 md:p-8 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold px-2 py-1 rounded bg-mesh text-white">
              Featured
            </span>
            {post.frontmatter.tags && post.frontmatter.tags[0] && (
              <Link
                href={`/blog?tag=${encodeURIComponent(post.frontmatter.tags[0].toLowerCase())}`}
                className="text-xs px-2 py-1 rounded bg-mountain-100 text-mountain-700 hover:bg-mountain-200 dark:bg-night-700 dark:text-mountain-300 dark:hover:bg-night-600 transition-colors"
              >
                {post.frontmatter.tags[0]}
              </Link>
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-mesh transition-colors">
            <Link href={`/blog/${post.slug}`}>{post.frontmatter.title}</Link>
          </h2>

          <p className="text-foreground-muted mb-4 line-clamp-3">
            {post.frontmatter.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-foreground-muted">
            <span>{post.frontmatter.author}</span>
            <time dateTime={post.frontmatter.date}>
              {formatDate(post.frontmatter.date)}
            </time>
            <span>{post.readingTime}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

// Pagination component
function Pagination({
  currentPage,
  totalPages,
  tag,
}: {
  currentPage: number;
  totalPages: number;
  tag?: string;
}) {
  if (totalPages <= 1) return null;

  const baseUrl = tag ? `/blog?tag=${encodeURIComponent(tag)}&` : '/blog?';

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-12"
      aria-label="Blog pagination"
    >
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={`${baseUrl}page=${currentPage - 1}`}
          className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground-muted hover:text-mesh border border-card-border rounded-md hover:border-mesh transition-colors"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground-muted/50 border border-card-border/50 rounded-md cursor-not-allowed">
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </span>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          const isActive = page === currentPage;
          return (
            <Link
              key={page}
              href={`${baseUrl}page=${page}`}
              className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-mesh text-white'
                  : 'text-foreground-muted hover:text-mesh hover:bg-mountain-100 dark:hover:bg-night-700'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={`${baseUrl}page=${currentPage + 1}`}
          className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground-muted hover:text-mesh border border-card-border rounded-md hover:border-mesh transition-colors"
        >
          Next
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
      ) : (
        <span className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground-muted/50 border border-card-border/50 rounded-md cursor-not-allowed">
          Next
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
        </span>
      )}
    </nav>
  );
}

// Tag filter component
function TagFilter({
  tags,
  activeTag,
}: {
  tags: string[];
  activeTag?: string;
}) {
  return (
    <div className="lg:hidden mb-8">
      <h2 className="text-sm font-semibold text-foreground-muted uppercase tracking-wider mb-3">
        Filter by topic
      </h2>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/blog"
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-colors ${
            !activeTag
              ? 'bg-mesh text-white'
              : 'bg-mountain-100 text-mountain-700 hover:bg-mountain-200 dark:bg-night-700 dark:text-mountain-300 dark:hover:bg-night-600'
          }`}
        >
          All Posts
        </Link>
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/blog?tag=${encodeURIComponent(tag)}`}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-colors ${
              activeTag === tag
                ? 'bg-mesh text-white'
                : 'bg-mountain-100 text-mountain-700 hover:bg-mountain-200 dark:bg-night-700 dark:text-mountain-300 dark:hover:bg-night-600'
            }`}
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  );
}

// Empty state component
function EmptyState({ tag }: { tag?: string }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-mountain-100 rounded-full flex items-center justify-center mx-auto mb-6">
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
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-3">
        {tag ? `No posts found for "${tag}"` : 'No blog posts yet'}
      </h2>
      <p className="text-foreground-muted mb-6 max-w-md mx-auto">
        {tag
          ? 'Try selecting a different topic or view all posts.'
          : "We're working on creating great content. Check back soon!"}
      </p>
      {tag && (
        <Link href="/blog" className="btn-mesh">
          View all posts
        </Link>
      )}
    </div>
  );
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const tag = typeof params.tag === 'string' ? params.tag : undefined;
  const pageParam = typeof params.page === 'string' ? params.page : '1';
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);

  // Get all tags for the filter
  const tags = getAllTags();

  // Get posts (filtered by tag if provided)
  const allPosts = tag ? getPostsByTag(tag) : getAllPosts();

  // Calculate pagination
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = allPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  // Get featured posts (first post if no tag filter and on first page)
  const featuredPost =
    !tag && currentPage === 1 && allPosts.length > 0 ? allPosts[0] : null;
  const regularPosts = featuredPost
    ? paginatedPosts.slice(1)
    : paginatedPosts;

  // Generate schema
  const blogSchema = generateBlogListSchema(allPosts);

  return (
    <>
      <JsonLd data={blogSchema} />

      {/* Active tag indicator (for desktop) */}
      {tag && (
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <span>Filtering by:</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-mesh text-white">
              {tag}
              <Link
                href="/blog"
                className="ml-1 hover:text-mesh-light"
                aria-label="Clear filter"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Link>
            </span>
          </div>
        </div>
      )}

      {/* Mobile tag filter */}
      <TagFilter tags={tags} activeTag={tag} />

      {/* Posts */}
      {allPosts.length === 0 ? (
        <EmptyState tag={tag} />
      ) : (
        <>
          {/* Featured post */}
          {featuredPost && (
            <div className="mb-8">
              <FeaturedPostCard post={featuredPost} />
            </div>
          )}

          {/* Regular posts grid */}
          {regularPosts.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {regularPosts.map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            tag={tag}
          />
        </>
      )}
    </>
  );
}
