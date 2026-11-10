import type { ButtonHTMLAttributes } from "react";

const buttonStyles = {
  primary: "bg-pine text-white hover:bg-pine-deep",
  secondary: "border border-line bg-card text-ink hover:bg-[#f7f3ea]",
  danger: "bg-danger text-white hover:bg-[#7d2222]",
  ghost: "text-ink hover:bg-ink/5",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonStyles }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-60 ${buttonStyles[variant]} ${className}`}
      {...props}
    />
  );
}
