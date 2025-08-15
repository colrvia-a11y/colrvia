'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Home as HomeIcon,
  Sparkles,
  Heart,
  Ellipsis,
  User,
  CreditCard,
  LifeBuoy,
  HelpCircle,
  Scale,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

type Classy = (string | false | null | undefined)[];
function cx(...c: Classy) {
  return c.filter(Boolean).join(' ');
}

type Item = {
  href?: string;
  label: 'Home' | 'Via' | 'Favorites' | 'More';
  icon: LucideIcon;
  onClick?: () => void;
};

export default function BottomNav() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const isActive = (target: string | undefined) => {
    if (!target) return false;
    if (target === '/start') return pathname === '/' || pathname?.startsWith('/start');
    if (target === '/dashboard') return pathname?.startsWith('/dashboard') || pathname?.startsWith('/reveal');
    if (target === '/via') return pathname?.startsWith('/via');
    return pathname === target;
  };

  const items: Item[] = [
    { href: '/start', label: 'Home', icon: HomeIcon },
    { href: '/via', label: 'Via', icon: Sparkles },
    { href: '/dashboard', label: 'Favorites', icon: Heart },
    // "More" handled via Sheet below
    { label: 'More', icon: Ellipsis },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <div className="mx-auto max-w-md px-3 pb-[env(safe-area-inset-bottom)]">
        <div className="rounded-2xl border bg-background/80 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <ul className="grid grid-cols-4">
            {items.slice(0, 3).map((item) => {
              const ActiveIcon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.label}>
                  <Link
                    href={item.href!}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    className={cx(
                      'group relative flex flex-col items-center gap-1 py-3 outline-none',
                      'focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    )}
                  >
                    <motion.span
                      className={cx('rounded-xl px-3 py-1')}
                      whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                      <ActiveIcon
                        aria-hidden="true"
                        className={cx(
                          'h-6 w-6',
                          active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                        )}
                      />
                    </motion.span>
                    <span
                      className={cx(
                        'text-[11px] leading-none',
                        active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}

            {/* More (Sheet) */}
            <li>
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="More"
                    className={cx(
                      'group relative flex w-full flex-col items-center gap-1 py-3 outline-none',
                      'focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    )}
                  >
                    <motion.span
                      className="rounded-xl px-3 py-1"
                      whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                      <Ellipsis aria-hidden="true" className="h-6 w-6 text-muted-foreground group-hover:text-foreground" />
                    </motion.span>
                    <span className="text-[11px] leading-none text-muted-foreground group-hover:text-foreground">
                      More
                    </span>
                    <span className="sr-only">Open account & help menu</span>
                  </button>
                </SheetTrigger>

                <SheetContent
                  side="bottom"
                  className="rounded-t-2xl border-t bg-background/95 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
                >
                  <SheetHeader>
                    <SheetTitle className="text-base">More</SheetTitle>
                  </SheetHeader>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <MoreLink href="/account" icon={User} label="Profile" />
                    <MoreLink href="/billing" icon={CreditCard} label="Billing" />
                    <MoreLink href="/support" icon={LifeBuoy} label="Support" />
                    <MoreLink href="/faq" icon={HelpCircle} label="FAQ" />
                    <MoreLink href="/legal" icon={Scale} label="Legal" />
                    <MoreLink href="/feedback" icon={MessageSquare} label="Feedback" />
                  </div>

                  <div className="mt-4 text-center text-xs text-muted-foreground">
                    Bossy-but-kind guidance. Paint this weekend. :)
                  </div>
                </SheetContent>
              </Sheet>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

function MoreLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className={cx(
        'flex items-center gap-2 rounded-xl border p-3 text-sm transition',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

