"use client";
import { Fragment } from "react";

type Chip = { value: string; label: string };
export function ChipList({
  chips,
  multi = false,
  onSelect,
  selected = [],
}: {
  chips: Chip[];
  multi?: boolean;
  onSelect: (values: string[]) => void;
  selected?: string[];
}) {
  function toggle(v: string) {
    if (multi) {
      onSelect(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
    } else {
      onSelect([v]);
    }
  }
  return (
    <div className="flex flex-wrap gap-2" role={multi ? "group" : "radiogroup"} aria-label="Quick choices">
      {chips.map(chip => (
        <button
          key={chip.value}
          type="button"
          onClick={() => toggle(chip.value)}
          className={[
            "px-3 py-2 rounded-full border border-black/10 text-sm",
            selected.includes(chip.value) ? "bg-black text-white" : "bg-white hover:bg-black/5"
          ].join(" ")}
          aria-pressed={selected.includes(chip.value)}
          aria-label={chip.label}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
