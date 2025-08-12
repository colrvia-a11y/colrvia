"use client"
import Link from 'next/link'
import { User } from 'lucide-react'
import { motion } from 'framer-motion'
import React from 'react'
import { track } from '@/lib/analytics'

export default function AccountIcon(){
  return (
    <motion.div whileTap={{ scale:0.95 }}>
  <Link href="/account" className="block" onClick={()=> track('nav_click',{ dest:'/account' })} aria-label="Account">
  <div className="rounded-full border bg-[var(--bg-surface)]/80 p-2 backdrop-blur hover:bg-[var(--linen)]/70 transition-colors">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
      </Link>
    </motion.div>
  )
}
