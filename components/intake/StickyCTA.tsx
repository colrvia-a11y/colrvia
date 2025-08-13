export function StickyCTA({ disabled }:{ disabled?:boolean }) {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-30 p-3 bg-white/85 dark:bg-neutral-900/85 backdrop-blur border-t supports-[padding:max(0px)]:pb-[max(env(safe-area-inset-bottom),12px)]">
      <button type="submit" disabled={disabled} className="w-full rounded-xl px-4 py-3 font-medium bg-brand text-brand-contrast hover:bg-brand-hover disabled:opacity-50">
        Generate (≈12s)
      </button>
    </div>
  );
}
