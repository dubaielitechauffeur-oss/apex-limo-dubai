import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import RichParagraph from "@/components/services/RichParagraph";
import BlogCard from "@/components/blog/BlogCard";
import BookingCTA from "@/components/home/BookingCTA";
import { buildMetadata, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/format";
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
    return buildMetadata({
      title: "Article Not Found",
      description: "This article could not be found on the Apex Limo blog.",
      path: `/blog/${slug}`,
    });
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

      {/* Hero */}
      <Section tone="obsidian" padding="sm" separator={false}>
        <Container>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-smoke transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Back to Blog
          </Link>

          <div className="mt-8 max-w-3xl">
            <time dateTime={post.publishDate} className="label-eyebrow">
              {formatDate(post.publishDate)}
            </time>
            <h1 className="mt-4 font-display text-3xl text-heading sm:text-5xl">{post.title}</h1>
            <p className="mt-5 text-sm leading-relaxed text-smoke sm:text-base">{post.excerpt}</p>
          </div>
        </Container>
      </Section>

      {/* Featured image */}
      <Section tone="ivory" separator={false} padding="sm">
        <Container>
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm border border-gold/15">
            <Image
              src={post.featuredImage.src}
              alt={post.featuredImage.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover"
            />
          </div>
        </Container>
      </Section>

      {/* Article body */}
      <Section tone="ivory" separator={false}>
        <Container>
          <div className="mx-auto max-w-3xl space-y-10">
            {post.content.map((section, index) => (
              <div key={index}>
                {section.heading ? (
                  <h2 className="mb-4 font-display text-2xl text-obsidian sm:text-3xl">
                    {section.heading}
                  </h2>
                ) : null}
                <div className="space-y-4">
                  {section.paragraphs.map((paragraph, pIndex) => (
                    <RichParagraph
                      key={pIndex}
                      text={paragraph}
                      className="text-sm leading-relaxed text-graphite sm:text-base"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* More from the blog — internal linking to other posts */}
      {relatedPosts.length > 0 ? (
        <Section tone="linen">
          <Container>
            <SectionHeading eyebrow="Keep Reading" title="More From the Blog" tone="light" />
            <div
              className={`mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-gold/15 bg-gold/15 sm:grid-cols-2 ${
                relatedPosts.length >= 3 ? "lg:grid-cols-3" : ""
              }`}
            >
              {relatedPosts.map((related) => (
                <BlogCard key={related.slug} post={related} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <BookingCTA
        eyebrow="Ready When You Are"
        heading="Reserve Your Chauffeur in Dubai Today"
        subtitle="Tell us where you're headed and we'll match you with the right vehicle and driver — usually confirmed within minutes."
      />
    </div>
  );
}
