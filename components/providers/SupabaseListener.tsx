"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function SupabaseListener() {
  const router = useRouter();

  useEffect(() => {
    const supabase = supabaseBrowser();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      // Ensure server components re-read cookies
      router.refresh();
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
