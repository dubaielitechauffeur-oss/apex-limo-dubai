/**
 * Invisible spam-trap field for lead forms. Real visitors never see or
 * reach it (off-screen, `aria-hidden`, excluded from tab order); bots that
 * blindly fill every input on the page populate it, which the API routes
 * (see lib/spam-protection.ts) treat as a silent-success spam submission.
 * Field name intentionally reads as a normal, autofill-tempting form field.
 */
export default function HoneypotField() {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
      <label htmlFor="company">Company</label>
      <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
