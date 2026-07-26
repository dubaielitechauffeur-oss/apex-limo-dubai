import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import BlogImageFrame from "@/components/blog/BlogImageFrame";
import BlogArticleContent from "@/components/blog/BlogArticleContent";
import BlogCard from "@/components/blog/BlogCard";
import BookingCTA from "@/components/home/BookingCTA";
import { buildMetadata, articleJsonLd, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { blogImageExists } from "@/lib/blogImage";
import { BLOG_POSTS, getBlogPostBySlug, getRelatedBlogPosts } from "@/data/blog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      ...buildMetadata({
        title: "Article Not Found",
        description: "This article could not be found on the Apex Limo journal.",
        path: `/blog/${slug}`,
      }),
      robots: { index: false, follow: false },
    };
  }

  return buildMetadata({
    title: post.seoTitle,
    description: post.seoDescription,
    path: `/blog/${post.slug}`,
    images: [post.featuredImage.src],
    type: "article",
    publishedTime: post.publishDate,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedBlogPosts(post.slug);
  const faqBlock = post.content.find((block) => block.type === "faq");
  const featuredImageExists = blogImageExists(post.featuredImage.src);

  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleJsonLd({
              title: post.title,
              description: post.seoDescription,
              image: post.featuredImage.src,
              publishDate: post.publishDate,
              path: `/blog/${post.slug}`,
            })
          ),
        }}
      />
      {faqBlock && faqBlock.type === "faq" ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqBlock.items)) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Blog", path: "/blog" },
              { name: post.title, path: `/blog/${post.slug}` },
            ])
          ),
        }}
      />

      {/* Featured image */}
      <Section tone="obsidian" padding="sm" separator={false}>
        <Container>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-smoke transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Back to Journal
          </Link>

          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-sm border border-gold/20">
            <BlogImageFrame
              image={post.featuredImage}
              exists={featuredImageExists}
              priority
              sizes="(max-width: 1024px) 100vw, 1000px"
            />
          </div>
        </Container>
      </Section>

      {/* Article header */}
      <Section tone="ivory" separator={false} padding="sm">
        <Container>
          <div className="mx-auto max-w-3xl">
            <time dateTime={post.publishDate} className="text-xs uppercase tracking-wide text-graphite">
              {formatDate(post.publishDate)}
            </time>
            <h1 className="mt-4 font-display text-3xl text-obsidian sm:text-5xl">{post.title}</h1>
            <p className="mt-5 text-sm leading-relaxed text-graphite sm:text-base">{post.excerpt}</p>
          </div>
        </Container>
      </Section>

      {/* Article content */}
      <Section tone="ivory" separator={false}>
        <Container>
          <div className="mx-auto max-w-3xl">
            <BlogArticleContent blocks={post.content} />
          </div>
        </Container>
      </Section>

      {/* More from the journal — internal linking to other posts */}
      {relatedPosts.length > 0 ? (
        <Section tone="linen">
          <Container>
            <SectionHeading eyebrow="Keep Reading" title="More From the Journal" tone="light" />
            <div
              className={`mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-gold/15 bg-gold/15 sm:grid-cols-2 ${
                relatedPosts.length >= 3 ? "lg:grid-cols-3" : ""
              }`}
            >
              {relatedPosts.map((related) => (
                <BlogCard
                  key={related.slug}
                  post={related}
                  imageExists={blogImageExists(related.featuredImage.src)}
                />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <BookingCTA
        heading="Need a Luxury Chauffeur in Dubai?"
        subtitle="Book a premium chauffeur-driven vehicle for airport transfers, business travel, city tours and special events."
      />
    </div>
  );
}
