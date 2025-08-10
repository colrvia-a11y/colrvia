"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabaseBrowser } from "@/lib/supabase/client"

export default function AuthRefreshListener() {
  const router = useRouter()
  useEffect(() => {
    const supabase = supabaseBrowser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.refresh()
    })
    return () => subscription?.unsubscribe?.()
  }, [router])
  return null
}
