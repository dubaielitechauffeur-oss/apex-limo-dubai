import { HTMLAttributes, ReactNode } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Consistent max-width + horizontal padding wrapper used across every section. */
export default function Container({
  children,
  className = "",
  ...props
}: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-8xl px-5 sm:px-8 lg:px-12 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
