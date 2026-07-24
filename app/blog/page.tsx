import type { Metadata } from "next";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import BlogCard from "@/components/blog/BlogCard";
import BookingCTA from "@/components/home/BookingCTA";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { getAllBlogPosts } from "@/data/blog";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Blog",
    description:
      "Guides and insights on chauffeur travel, airport transfers, weddings, and corporate transportation in Dubai — from the Apex Limo & Chauffeur Dubai team.",
    path: "/blog",
  });
}

/** ItemList of BlogPosting entities for the blog listing page. */
function blogListJsonLd(posts: ReturnType<typeof getAllBlogPosts>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE.name} Blog`,
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

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListJsonLd(posts)) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "Blog", path: "/blog" }])),
        }}
      />

      {/* Hero */}
      <Section tone="obsidian" padding="sm" separator={false}>
        <Container className="text-center">
          <span className="label-eyebrow">Insights &amp; Guides</span>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl text-heading sm:text-5xl">
            The Apex Journal
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-smoke sm:text-base">
            Guides and insights on chauffeur travel, airport transfers, weddings, and corporate
            transportation across Dubai.
          </p>
        </Container>
      </Section>

      {/* Post grid */}
      <Section tone="ivory">
        <Container>
          <SectionHeading
            eyebrow="Latest Articles"
            title="From the Apex Team"
            subtitle="Practical guides drawn from years of chauffeuring executives, wedding parties, and visiting delegations across Dubai."
            tone="light"
          />

          <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-gold/15 bg-gold/15 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </Container>
      </Section>

      <BookingCTA />
    </div>
  );
}
