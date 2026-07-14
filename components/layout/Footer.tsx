import Link from "next/link";
import Image from "next/image";
import Container from "@/components/shared/Container";
import {
  NAV_LINKS,
  SERVICES,
  SITE,
  getPhoneLink,
  getWhatsAppLink,
} from "@/lib/constants";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gold/15 bg-obsidian">
      <Container className="py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Image
              src="/images/brand/apex-logo.webp"
              alt={`${SITE.name} logo`}
              width={220}
              height={225}
              className="h-16 w-auto"
            />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-smoke">
              {SITE.tagline}. Professional chauffeurs, a premium fleet, and
              dependable service across Dubai.
            </p>
          </div>

          {/* Sitemap */}
          <div>
            <h3 className="label-eyebrow mb-5">Explore</h3>
            <ul className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-smoke transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="label-eyebrow mb-5">Services</h3>
            <ul className="flex flex-col gap-3">
              {SERVICES.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-sm text-smoke transition-colors hover:text-gold"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="label-eyebrow mb-5">Reach Us</h3>
            <ul className="flex flex-col gap-3 text-sm text-smoke">
              <li>
                <a href={getPhoneLink()} className="transition-colors hover:text-gold">
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-gold"
                >
                  WhatsApp Us
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="transition-colors hover:text-gold"
                >
                  {SITE.email}
                </a>
              </li>
              <li className="pt-1 text-smoke/80">Dubai, United Arab Emirates</li>
            </ul>
          </div>
        </div>

        <div className="route-line my-10 opacity-40" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-smoke/70 sm:flex-row">
          <p>
            &copy; {year} {SITE.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="transition-colors hover:text-gold">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-gold">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
