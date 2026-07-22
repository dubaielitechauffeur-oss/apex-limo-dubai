import type { ReactNode } from "react";
import Container from "@/components/shared/Container";

interface ConversionSeoIntroProps {
  children: ReactNode;
}

/** Short, keyword-natural SEO paragraph shown above the booking/quote forms. */
export default function ConversionSeoIntro({ children }: ConversionSeoIntroProps) {
  return (
    <section className="bg-[#0A0A0A] pb-10 sm:pb-12">
      <Container className="max-w-3xl text-center">
        <p className="text-sm leading-relaxed text-[#999999] sm:text-[15px]">{children}</p>
      </Container>
    </section>
  );
}
