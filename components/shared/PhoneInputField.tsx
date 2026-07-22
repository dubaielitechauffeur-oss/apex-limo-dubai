"use client";

import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface PhoneInputFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  ariaDescribedBy?: string;
}

/**
 * International phone input — country flag + code selector defaulting to
 * the UAE, with automatic formatting as the user types. Wraps
 * react-phone-number-input, scoped via the `.phone-field` class in
 * globals.css so its styling never leaks into unrelated inputs.
 */
export default function PhoneInputField({
  id,
  value,
  onChange,
  error,
  ariaDescribedBy,
}: PhoneInputFieldProps) {
  return (
    <div className={`phone-field ${error ? "phone-field-error" : ""}`}>
      <PhoneInput
        id={id}
        international
        defaultCountry="AE"
        value={value}
        onChange={(next) => onChange(next ?? "")}
        aria-describedby={ariaDescribedBy}
        aria-invalid={error}
        placeholder="Enter phone number"
      />
    </div>
  );
}
