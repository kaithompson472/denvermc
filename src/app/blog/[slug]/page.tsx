import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getPostSlugs, getRelatedPosts } from '@/lib/blog';
import { generateBlogPostingSchema } from '@/lib/schemas/blog';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';
import JsonLd from '@/components/JsonLd';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { useMDXComponents } from '../../../../mdx-components';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { BASE_URL } from '@/lib/constants';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generate static params for all published blog posts
 * This enables static generation at build time
 */
export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

/**
 * Generate dynamic metadata for each blog post
 * Includes OpenGraph, Twitter cards, and SEO metadata
 */
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const { frontmatter } = post;
  const postUrl = `${BASE_URL}/blog/${slug}`;

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    keywords: frontmatter.tags,
    authors: [{ name: frontmatter.author, url: frontmatter.authorUrl }],
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      type: 'article',
      url: postUrl,
      publishedTime: frontmatter.date,
      authors: [frontmatter.author],
      tags: frontmatter.tags,
      images: frontmatter.image
        ? [
            {
              url: frontmatter.image.startsWith('http')
                ? frontmatter.image
                : `${BASE_URL}${frontmatter.image}`,
              alt: frontmatter.imageAlt || frontmatter.title,
            },
          ]
        : [
            {
              url: `${BASE_URL}/logo-512.png`,
              width: 512,
              height: 512,
              alt: 'Denver MeshCore Logo',
            },
          ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@denver_meshcore',
      creator: '@denver_meshcore',
      title: frontmatter.title,
      description: frontmatter.description,
      images: frontmatter.image
        ? [frontmatter.image.startsWith('http') ? frontmatter.image : `${BASE_URL}${frontmatter.image}`]
        : [`${BASE_URL}/logo-512.png`],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Check if post is unpublished
  if (post.frontmatter.published === false) {
    notFound();
  }

  const { frontmatter, content, readingTime, wordCount } = post;

  // Generate schemas for SEO
  const blogPostingSchema = generateBlogPostingSchema({
    slug,
    frontmatter,
    readingTime,
    wordCount,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Blog', url: `${BASE_URL}/blog` },
    { name: frontmatter.title, url: `${BASE_URL}/blog/${slug}` },
  ]);

  // Get related posts based on shared tags
  const relatedPosts = getRelatedPosts(slug, 3);

  // Format the date nicely
  const formattedDate = new Date(frontmatter.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get MDX components
  const components = useMDXComponents({});

  return (
    <>
      <JsonLd data={blogPostingSchema} />
      <JsonLd data={breadcrumbSchema} />

      <article className="min-h-screen bg-mesh">
        {/* Hero Section with Featured Image */}
        <header className="px-6 py-12 md:py-20 bg-background-secondary">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-sm text-foreground-muted">
                <li>
                  <Link href="/" className="hover:text-mesh transition-colors">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/blog" className="hover:text-mesh transition-colors">
                    Blog
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-foreground truncate max-w-[200px]" aria-current="page">
                  {frontmatter.title}
                </li>
              </ol>
            </nav>

            {/* Tags */}
            {frontmatter.tags && frontmatter.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {frontmatter.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-mesh/10 text-mesh"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              {frontmatter.title}
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-foreground-muted mb-6 max-w-3xl">
              {frontmatter.description}
            </p>

            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-muted">
              {/* Author */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-mesh/20 flex items-center justify-center">
                  <span className="text-mesh font-semibold text-sm">
                    {frontmatter.author.charAt(0).toUpperCase()}
                  </span>
                </div>
                {frontmatter.authorUrl ? (
                  <a
                    href={frontmatter.authorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground hover:text-mesh transition-colors"
                  >
                    {frontmatter.author}
                  </a>
                ) : (
                  <span className="font-medium text-foreground">{frontmatter.author}</span>
                )}
              </div>

              <span aria-hidden="true" className="text-card-border">
                |
              </span>

              {/* Date */}
              <time dateTime={frontmatter.date} className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formattedDate}
              </time>

              <span aria-hidden="true" className="text-card-border">
                |
              </span>

              {/* Reading time */}
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {readingTime}
              </span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {frontmatter.image && (
          <div className="px-6 -mt-4 mb-8">
            <div className="max-w-4xl mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={frontmatter.image}
                alt={frontmatter.imageAlt || frontmatter.title}
                className="w-full h-auto rounded-xl shadow-lg"
                loading="eager"
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="px-6 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <MDXRemote
                source={content}
                components={components}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [rehypeSlug],
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Author Bio / CTA Section */}
        <section className="px-6 py-12 bg-background-secondary">
          <div className="max-w-4xl mx-auto">
            <div className="card-mesh p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-16 h-16 rounded-full bg-mesh/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-mesh font-bold text-2xl">
                    {frontmatter.author.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-foreground mb-2">
                    Written by {frontmatter.author}
                  </h2>
                  <p className="text-foreground-muted mb-4">
                    Thanks for reading! Join our community to discuss this article and connect with
                    other mesh networking enthusiasts.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://discord.gg/QpaW8FTTCE"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm"
                    >
                      Join Discord
                    </a>
                    <Link href="/start" className="btn-outline text-sm">
                      Get Started with MeshCore
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="px-6 py-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/blog/${relatedPost.slug}`}
                    className="card-mesh p-4 hover:border-mesh transition-colors group"
                  >
                    <h3 className="font-semibold text-foreground group-hover:text-mesh transition-colors mb-2 line-clamp-2">
                      {relatedPost.frontmatter.title}
                    </h3>
                    <p className="text-sm text-foreground-muted line-clamp-2 mb-3">
                      {relatedPost.frontmatter.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-foreground-muted">
                      <span>{relatedPost.readingTime}</span>
                      <span className="text-mesh group-hover:translate-x-1 transition-transform">
                        Read more &rarr;
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Back to Blog CTA */}
        <section className="px-6 py-8 border-t border-card-border">
          <div className="max-w-4xl mx-auto flex justify-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-foreground-muted hover:text-mesh transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to all articles
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
