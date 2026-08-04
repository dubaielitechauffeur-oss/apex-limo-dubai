import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import BlogSearch from "@/components/blog/BlogSearch";
import BookingCTA from "@/components/home/BookingCTA";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { blogImageExists } from "@/lib/blogImage";
import { getAllBlogPosts } from "@/data/blog";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.blog" });
  return buildMetadata({
    locale: locale as Locale,
    title: t("title"),
    description: t("description"),
    path: "/blog",
  });
}

/** ItemList of BlogPosting entities for the journal listing page. */
function blogListJsonLd(posts: ReturnType<typeof getAllBlogPosts>, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    inLanguage: locale,
    name: `${SITE.name} Journal`,
    url: `${SITE.url}/blog`,
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        url: `${SITE.url}/blog/${post.slug}`,
        datePublished: post.publishDate,
      },
    })),
  };
}

export default async function BlogPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("blog.hero");
  const tNav = await getTranslations("common.nav");
  const posts = getAllBlogPosts(locale as Locale);
  const imageExistsBySlug = Object.fromEntries(
    posts.map((post) => [post.slug, blogImageExists(post.featuredImage.src)])
  );

  return (
    <div>
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListJsonLd(posts, locale as Locale)) }}
      />
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ name: tNav("blog"), path: "/blog" }], locale as Locale, tNav("home"))
          ),
        }}
      />

      {/* Hero */}
      <Section tone="obsidian" padding="sm" separator={false}>
        <Container className="text-center">
          <span className="animate-fade-in label-eyebrow">{t("eyebrow")}</span>
          <h1 className="mx-auto mt-5 max-w-3xl animate-fade-in font-display text-4xl text-heading [animation-delay:150ms] sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl animate-fade-in text-sm leading-relaxed text-smoke [animation-delay:300ms] sm:text-base">
            {t("subtitle")}
          </p>
        </Container>
      </Section>

      {/* Search + grid */}
      <Section tone="ivory">
        <Container>
          <BlogSearch posts={posts} imageExistsBySlug={imageExistsBySlug} />
        </Container>
      </Section>

      <BookingCTA />
    </div>
  );
}
