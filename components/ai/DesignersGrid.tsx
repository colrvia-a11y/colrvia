"use client"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { designers } from "@/lib/ai/designers"
import Link from "next/link"
import { track } from "@/lib/analytics"
import { motion } from 'framer-motion'

export default function DesignersGrid(){
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {designers.map(d => (
        <motion.div key={d.id} whileHover={{ y:-4, rotate:-0.25 }} transition={{ type:'spring', stiffness:260, damping:20 }}>
        <Card className="group rounded-2xl shadow-sm border hover:shadow-md transition-shadow p-5 flex flex-col h-full">
          <div className="text-5xl mb-3" aria-hidden>{d.avatar}</div>
          <h2 className="text-xl font-medium">{d.name}</h2>
          <p className="text-sm text-[var(--ink-subtle)] mb-4">{d.tagline}</p>
          <div className="mt-auto">
            <Button as={Link} href={`/start/preferences?designerId=${d.id}`} className="w-full" onClick={()=> track('designer_select',{ designerId: d.id })} aria-label={`Start with ${d.name}`}>
              Start with {d.short}
            </Button>
          </div>
        </Card>
        </motion.div>
      ))}
    </div>
  )
}
