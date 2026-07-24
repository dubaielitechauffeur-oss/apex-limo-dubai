import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import BookingCTA from "@/components/home/BookingCTA";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { formatDate } from "@/lib/format";
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
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-ivory transition-colors duration-200 hover:bg-ivory-off"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-sm">
                  <Image
                    src={post.featuredImage.src}
                    alt={post.featuredImage.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col p-8">
                  <time
                    dateTime={post.publishDate}
                    className="text-xs uppercase tracking-wide text-graphite"
                  >
                    {formatDate(post.publishDate)}
                  </time>
                  <h2 className="mt-3 font-display text-xl text-obsidian">{post.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-graphite">
                    {post.excerpt}
                  </p>
                  <span className="mt-6 inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-wide text-gold-deep transition-colors duration-200 group-hover:text-obsidian">
                    Read More
                    <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <BookingCTA />
    </div>
  );
}
