interface FormSectionHeadingProps {
  step: number;
  title: string;
  subtitle?: string;
}

/** Numbered divider used to break a long form into a premium, guided concierge process. */
export default function FormSectionHeading({ step, title, subtitle }: FormSectionHeadingProps) {
  return (
    <div className="flex items-center gap-3 border-b border-[rgba(201,161,74,0.15)] pb-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#C9A14A]/40 font-display text-sm text-[#C9A14A]">
        {step}
      </span>
      <div>
        <h3 className="font-display text-base text-white sm:text-lg">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-[#999999]">{subtitle}</p> : null}
      </div>
    </div>
  );
}
