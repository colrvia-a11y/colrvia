"use client"

import React from 'react'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useStartStory } from '@/components/ux/StartStoryPortal'
import { motion } from "framer-motion"
import { Home, Sparkles, BookOpen } from "lucide-react"
import { useEffect, useState } from "react"
import { track } from "@/lib/analytics"

function useReducedMotionPref() {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const on = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener?.("change", on)
    return () => mq.removeEventListener?.("change", on)
  }, [])
  return reduced
}

const NAV = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/designers", label: "New", Icon: Sparkles },
  { href: "/stories", label: "Stories", Icon: BookOpen }
] as const

export default function BottomTabBar() {
  const pathname = usePathname() || "/"
  const reduced = useReducedMotionPref()
  let startStory: (href:string)=>void = ()=>{}
  try { startStory = useStartStory() } catch {}

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-[var(--bg-surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg-surface)]/70"
      role="navigation"
      aria-label="Primary"
    >
      <div className="mx-auto max-w-3xl">
        <ul className="grid grid-cols-3 gap-1 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href))
            return (
              <li key={href} className="flex justify-center">
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  whileHover={reduced ? {} : { y: -1 }}
                  className={[
                    "w-full max-w-[160px] rounded-2xl px-2 py-1.5 text-center",
                    active ? "bg-[var(--brand)]/10" : "hover:bg-[var(--color-linen)]/60"
                  ].join(" ")}
                >
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={(e) => { track("nav_click", { dest: href }); if(href==='/designers'){ e.preventDefault(); startStory('/designers') } }}
                    className="flex flex-col items-center gap-0.5"
                  >
                    <Icon className={["h-5 w-5", active ? "text-[var(--brand)]" : "text-[var(--ink-subtle)]"].join(" ")} />
                    <span className={["text-[11px] leading-none", active ? "text-[var(--brand)]" : "text-[var(--ink-subtle)]"].join(" ")}>{label}</span>
                  </Link>
                </motion.div>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
