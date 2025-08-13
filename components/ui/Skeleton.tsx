import { clsx } from "clsx";

type Props = { className?: string };

export function Skeleton({ className = "h-40 w-full" }: Props) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-lg bg-neutral-200/60 dark:bg-neutral-700/60",
        className
      )}
    />
  );
}
