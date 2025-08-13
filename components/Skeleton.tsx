export function Skeleton({ className = "h-40 w-full" }) {
  return (
    <div className={`animate-pulse rounded-lg bg-neutral-200/60 dark:bg-neutral-700/60 ${className}`} />
  );
}
