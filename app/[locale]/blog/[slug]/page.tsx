import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import DirectionalIcon from "@/components/shared/DirectionalIcon";
import SectionHeading from "@/components/shared/SectionHeading";
import Reveal from "@/components/shared/Reveal";
import BlogImageFrame from "@/components/blog/BlogImageFrame";
import BlogArticleContent from "@/components/blog/BlogArticleContent";
import BlogCard from "@/components/blog/BlogCard";
import BookingCTA from "@/components/home/BookingCTA";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildMetadata, articleJsonLd, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { blogImageExists } from "@/lib/blogImage";
import { getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/public/cms-content";
import { BLOG_POSTS } from "@/data/blog";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// See app/[locale]/services/page.tsx for the revalidation strategy note.
export const revalidate = 300;

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlug(slug, locale as Locale);

  if (!post) {
    const t = await getTranslations({ locale: locale as Locale, namespace: "metadata.blogPost" });
    return {
      ...buildMetadata({
        locale: locale as Locale,
        title: t("notFoundTitle"),
        description: t("notFoundDescription"),
        path: `/blog/${slug}`,
      }),
      robots: { index: false, follow: false },
    };
  }

  return buildMetadata({
    locale: locale as Locale,
    title: post.seoTitle,
    description: post.seoDescription,
    path: `/blog/${post.slug}`,
    images: [post.featuredImage.src],
    type: "article",
    publishedTime: post.publishDate,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);
  const post = await getBlogPostBySlug(slug, locale as Locale);

  if (!post) {
    notFound();
  }

  const t = await getTranslations("blog.detail");
  const tNav = await getTranslations("common.nav");
  const relatedPosts = await getRelatedBlogPosts(post.slug, locale as Locale);
  const faqBlock = post.content.find((block) => block.type === "faq");
  const featuredImageExists = blogImageExists(post.featuredImage.src);

  return (
    <div>
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleJsonLd({
              locale: locale as Locale,
              title: post.title,
              description: post.seoDescription,
              image: post.featuredImage.src,
              publishDate: post.publishDate,
              path: `/blog/${post.slug}`,
              authorName: post.author.name,
              authorEmail: post.author.email,
            })
          ),
        }}
      />
      {faqBlock && faqBlock.type === "faq" ? (
        <script
          type="application/ld+json"

          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqBlock.items, locale as Locale)) }}
        />
      ) : null}
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd(
              [
                { name: tNav("blog"), path: "/blog" },
                { name: post.title, path: `/blog/${post.slug}` },
              ],
              locale as Locale,
              tNav("home")
            )
          ),
        }}
      />

      {/* Featured image */}
      <Section tone="obsidian" padding="sm" separator={false}>
        <Container>
          <Link
            href="/blog"
            className="inline-flex animate-fade-in items-center gap-2 text-xs uppercase tracking-wide text-smoke transition-colors hover:text-gold"
          >
            <DirectionalIcon icon={ArrowLeft} className="h-3.5 w-3.5" strokeWidth={2} />
            {t("backToJournal")}
          </Link>

          <div className="relative mt-8 aspect-[16/9] w-full animate-fade-in overflow-hidden rounded-sm border border-gold/20 [animation-delay:150ms]">
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
          <div className="mx-auto max-w-3xl animate-fade-in [animation-delay:250ms]">
            <time dateTime={post.publishDate} className="text-xs uppercase tracking-wide text-graphite">
              {formatDate(post.publishDate, locale as Locale)}
            </time>
            <h1 className="mt-4 font-display text-3xl text-obsidian sm:text-5xl">{post.title}</h1>
            <p className="mt-5 text-sm leading-relaxed text-graphite sm:text-base">{post.excerpt}</p>

            {/* Author byline */}
            <div className="mt-8 border-t border-gold/15 pt-6">
              <p className="text-xs uppercase tracking-wide text-graphite">
                {t("byAuthor")}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gold to-gold-deep opacity-30" />
                <div>
                  <p className="font-medium text-obsidian">{post.author.name}</p>
                  <p className="text-xs text-graphite">{post.author.title}</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Article content */}
      <Section tone="ivory" separator={false}>
        <Container>
          <Reveal className="mx-auto max-w-3xl">
            <BlogArticleContent blocks={post.content} />
          </Reveal>
        </Container>
      </Section>

      {/* More from the journal — internal linking to other posts */}
      {relatedPosts.length > 0 ? (
        <Section tone="linen">
          <Container>
            <Reveal>
              <SectionHeading eyebrow={t("keepReadingEyebrow")} title={t("moreFromJournalTitle")} tone="light" />
            </Reveal>
            <div
              className={`mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-gold/15 bg-gold/15 sm:grid-cols-2 ${
                relatedPosts.length >= 3 ? "lg:grid-cols-3" : ""
              }`}
            >
              {relatedPosts.map((related, index) => (
                <Reveal key={related.slug} delay={index * 80}>
                  <BlogCard
                    post={related}
                    imageExists={blogImageExists(related.featuredImage.src)}
                  />
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <BookingCTA
        heading={t("bookingCtaHeading")}
        subtitle={t("bookingCtaSubtitle")}
      />
    </div>
  );
}
