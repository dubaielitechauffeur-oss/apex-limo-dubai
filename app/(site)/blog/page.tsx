import type { Metadata } from "next";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import BlogSearch from "@/components/blog/BlogSearch";
import BookingCTA from "@/components/home/BookingCTA";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { blogImageExists } from "@/lib/blogImage";
import { getAllBlogPosts } from "@/data/blog";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Journal",
    description:
      "Travel tips, chauffeur guides, airport transfer advice, business travel insights and luxury transportation updates from Apex Limo & Chauffeur Dubai.",
    path: "/blog",
  });
}

/** ItemList of BlogPosting entities for the journal listing page. */
function blogListJsonLd(posts: ReturnType<typeof getAllBlogPosts>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
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

export default function BlogPage() {
  const posts = getAllBlogPosts();
  const imageExistsBySlug = Object.fromEntries(
    posts.map((post) => [post.slug, blogImageExists(post.featuredImage.src)])
  );

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
          <span className="label-eyebrow">Insights &amp; Journal</span>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl text-heading sm:text-5xl">
            Luxury Chauffeur Insights
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-smoke sm:text-base">
            Travel tips, chauffeur guides, airport transfer advice, business travel insights and
            luxury transportation updates.
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
