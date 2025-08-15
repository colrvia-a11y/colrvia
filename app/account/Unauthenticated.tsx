'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';

export default function UnauthenticatedAccount() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl leading-[1.05] mb-4">Account</h1>

      <section className="rounded-2xl border border-linen bg-surface p-6 shadow-soft space-y-3">
        <p className="text-sm text-muted-foreground">
          You’re not signed in. Sign in to manage your profile, subscription, and saved Color Stories.
        </p>

        <div className="flex gap-2">
          <Button
            as={Link}
            href="/sign-in?next=/account"
            variant="outline"
            aria-label="Sign in to your account"
          >
            Sign in
          </Button>
          <Button
            as={Link}
            href="/sign-in?next=/account&mode=password&pw=signup"
            aria-label="Create a new account"
          >
            Create account
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          One free story. Subscriptions for more. Bossy-but-kind guidance. 💛
        </p>
      </section>
    </main>
  );
}

