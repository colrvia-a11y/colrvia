export function AppShell({
  header,
  children,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-[calc(64px+env(safe-area-inset-bottom))]">
      {header && (
        <header className="sticky top-0 z-40 bg-[var(--paper)]/85 backdrop-blur-sm border-b border-[var(--border)]">
          {header}
        </header>
      )}
      {children}
    </div>
  );
}
