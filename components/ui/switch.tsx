import { useCallback } from "react";
import { clsx } from "clsx";

export function Switch({ id, checked, onCheckedChange, className = "", ...props }: {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
} & React.HTMLAttributes<HTMLButtonElement>) {
  const toggle = useCallback(() => onCheckedChange?.(!checked), [onCheckedChange, checked]);
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={toggle}
      type="button"
      className={clsx(
        "relative inline-flex h-5 w-9 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        checked ? "bg-primary" : "bg-muted",
        className
      )}
      {...props}
    >
      <span
        className={clsx(
          "pointer-events-none inline-block h-4 w-4 rounded-full bg-background transition-transform",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}
export default Switch;
