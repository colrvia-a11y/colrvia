// components/chat/QuickReplies.tsx
"use client";

export type Chip = { value: string; label: string };

export function QuickReplies({
  chips,
  selected,
  onSelect,
  multi,
}: {
  chips: Chip[];
  selected: string[];
  onSelect: (vals: string[]) => void;
  multi?: boolean;
}) {
  function toggle(val: string) {
    if (multi) {
      onSelect(
        selected.includes(val)
          ? selected.filter((v) => v !== val)
          : [...selected, val]
      );
    } else {
      onSelect([val]);
    }
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {chips.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => toggle(c.value)}
          className={`rounded-full px-3 py-1 text-sm whitespace-nowrap shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${selected.includes(c.value)
            ? "bg-[var(--bubble-user)] text-[var(--bubble-user-ink)]"
            : "bg-[var(--chip-bg)] text-[var(--chip-ink)]"}
          `}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

