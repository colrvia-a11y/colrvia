export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 pointer-events-none">
      <div className="mx-auto max-w-screen-sm px-4 pb-[env(safe-area-inset-bottom)]">
        <div className="pointer-events-auto mb-3 rounded-2xl backdrop-blur-sm bg-[color-mix(in_oklab,var(--surface)_80%,white_20%)] border border-[var(--border)] shadow-md h-14 flex items-center justify-around">
          {/* TODO: map actual tabs; active gets subtle underline */}
          <a className="px-4 py-2">Home</a>
          <a className="px-4 py-2">Start</a>
          <a className="px-4 py-2">Palettes</a>
          <a className="px-4 py-2">More</a>
        </div>
      </div>
    </nav>
  );
}
