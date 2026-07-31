interface LtrProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Isolates always-Latin-digit content (phone numbers, counts glued to a
 * label) from the surrounding bidi context. Without this, the Unicode
 * Bidi Algorithm can visually reorder digit groups when they sit inside
 * RTL text flow — e.g. a phone number rendering back-to-front. Wrap only
 * the number-bearing span itself, never a whole sentence/link that also
 * carries translatable text.
 */
export default function Ltr({ children, className = "" }: LtrProps) {
  return (
    <span dir="ltr" className={className}>
      {children}
    </span>
  );
}
