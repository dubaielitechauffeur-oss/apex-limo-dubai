/**
 * Testimonial data structure. Populated with real, direct customer
 * testimonials (source: "direct"). Once the Google Business Profile is
 * connected, real Google reviews can be synced in alongside these with
 * source: "google" and a profileUrl pointing at the live review — no shape
 * changes needed elsewhere, since every field here already mirrors what the
 * Google Places "reviews" API returns (author name, rating, text, time).
 */
export type ReviewSource = "google" | "direct";

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  text: string;
  serviceUsed: string;
  location: string;
  date: string;
  source: ReviewSource;
  avatarInitials: string;
  /** Populated once synced from a real Google review. */
  profileUrl?: string;
  /** Shown in the homepage's 3-card featured spotlight; all reviews still count toward the aggregate rating/JSON-LD regardless of this flag. */
  featured?: boolean;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "review-001",
    name: "Rana Moazam Ali",
    rating: 5,
    text: "Apex Limo & Chauffeur Dubai's service is amazing! The driver arrived on time, the car was spotless and luxurious. The ride from Dubai airport to the hotel was very comfortable. The staff is very polite and professional. The price was also reasonable and confirmed upfront. If anyone in Dubai needs VIP travel, I 100% recommend Apex Limo. Thank you team!",
    serviceUsed: "Airport Transfers",
    location: "Dubai International Airport (DXB)",
    date: "2026-06-25",
    source: "direct",
    avatarInitials: "RA",
    featured: true,
  },
  {
    id: "review-002",
    name: "Akbar Malik",
    rating: 5,
    text: "Excellent experience with Apex Limo & Chauffeur Dubai. From booking to drop-off, everything was smooth and professional. If you're looking for a dependable Dubai airport transfer or luxury limousine service, this company is an excellent choice.",
    serviceUsed: "Luxury Chauffeur Service",
    location: "Downtown Dubai",
    date: "2026-06-10",
    source: "direct",
    avatarInitials: "AM",
  },
  {
    id: "review-003",
    name: "Selena Lawson",
    rating: 5,
    text: "I had an amazing experience with Apex Limo & Chauffeur Dubai. Their chauffeur service in Dubai was professional, punctual, and very comfortable. The luxury car was spotless, and the driver was polite. Highly recommended for anyone looking for a reliable Dubai limousine service.",
    serviceUsed: "Luxury Chauffeur Service",
    location: "Dubai Marina",
    date: "2026-05-28",
    source: "direct",
    avatarInitials: "SL",
    featured: true,
  },
  {
    id: "review-004",
    name: "Huzaifa Rajput",
    rating: 5,
    text: "I was in Dubai for a few days and chose Apex Limo & Chauffeur Dubai after seeing their good reputation. They provided excellent airport transfer and luxury transportation. The chauffeur arrived on time, and the whole experience was smooth and stress-free. Highly recommended.",
    serviceUsed: "Airport Transfers",
    location: "Dubai International Airport (DXB)",
    date: "2026-06-15",
    source: "direct",
    avatarInitials: "HR",
  },
  {
    id: "review-005",
    name: "Abdul Haseeb",
    rating: 5,
    text: "During my trip to Dubai, I booked Apex Limo and Chauffeur Dubai for city travel. The booking process was easy, the driver was friendly, and the vehicle was clean and luxurious. One of the best chauffeur services in Dubai. I will definitely use them again on my next visit.",
    serviceUsed: "Luxury Chauffeur Service",
    location: "Downtown Dubai",
    date: "2026-05-02",
    source: "direct",
    avatarInitials: "AH",
  },
  {
    id: "review-006",
    name: "Okasha Chauhdry",
    rating: 5,
    text: "I had an excellent experience with Apex Limo & Chauffeur Dubai. The chauffeur was professional, arrived on time, and the vehicle was clean and luxurious. One of the best limousine services in Dubai. Highly recommended!",
    serviceUsed: "VIP Transportation",
    location: "Palm Jumeirah",
    date: "2026-06-30",
    source: "direct",
    avatarInitials: "OC",
    featured: true,
  },
];
