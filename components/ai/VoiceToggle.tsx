"use client"
import { Volume2, VolumeX } from "lucide-react"
export function VoiceToggle({ active }: { active: boolean }) {
  return active ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />
}
