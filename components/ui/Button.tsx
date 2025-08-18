/* eslint-disable react/button-has-type */
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  as?: React.ElementType;
  href?: string;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  as: Component = "button",
  href,
  type,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl transition-[transform,box-shadow,opacity] duration-[var(--dur-2)] ease-[var(--ease-standard)] disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-[1px]";
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-base",
  } as const;
  const variants = {
    primary:
      "bg-[var(--accent)] text-[var(--accent-ink)] shadow-md hover:brightness-105",
    secondary:
      "bg-[var(--surface)] text-[var(--ink)] border border-[var(--border)] hover:bg-[var(--surface-elev)]",
    outline:
      "bg-transparent text-[var(--ink)] border border-[var(--border)] hover:bg-[color-mix(in_oklab,var(--surface)_80%,white_20%)]",
    ghost:
      "bg-transparent text-[var(--ink)] hover:bg-[color-mix(in_oklab,var(--surface)_82%,white_18%)]",
  } as const;
  const classes = cn(base, sizes[size], variants[variant], className);
  if (Component !== "button") {
    return (
      <Component href={href} className={classes} {...props}>
        {loading && (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent-ink)] border-r-transparent" />
        )}
        {children}
      </Component>
    );
  }
  return (
    <button type={type ?? "button"} className={classes} {...props}>
      {loading && (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent-ink)] border-r-transparent" />
      )}
      {children}
    </button>
  );
}
