"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

function AuthCallbackEffect() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();
      const next = sp.get("next") ?? "/dashboard";

      // If provider returned an error, bounce to error screen
      const errParam = sp.get("error") || sp.get("error_description");
      if (errParam) {
        router.replace(`/auth/error?m=${encodeURIComponent(errParam)}`);
        return;
      }

      // Let Supabase parse the URL (hash or ?code) automatically,
      // then read the stored session.
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        router.replace(`/auth/error?m=${encodeURIComponent(error.message)}`);
        return;
      }

      if (data.session) {
        // Clean up the URL (remove hash/query) and go to next page
        router.replace(next);
      } else {
        // Nothing to process; send back to sign-in
        router.replace("/sign-in");
      }
    })();
  }, [router, sp]);
  return null;
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackEffect />
      <div className="px-6 py-12 text-center">
        <p>Signing you in…</p>
      </div>
    </Suspense>
  );
}
