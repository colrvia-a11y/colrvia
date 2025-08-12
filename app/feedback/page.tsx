"use client"
import { useState } from 'react'

export default function FeedbackPage(){
  const [submitted,setSubmitted]=useState(false)
  function submit(e:React.FormEvent){ e.preventDefault(); setSubmitted(true) }
  return (
    <main className="max-w-xl mx-auto px-4 py-12 space-y-6">
      <h1 className="font-display text-4xl leading-[1.05]">Feedback</h1>
      {!submitted ? (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-muted-foreground">Tell us what would make this better.</p>
          <textarea required className="w-full h-40 rounded-lg border px-3 py-2" placeholder="Your thoughts" />
          <button type="submit" className="btn btn-primary">Send feedback</button>
        </form>
      ) : (
  <p className="text-sm text-muted-foreground">Thanks! We appreciate it.</p>
      )}
    </main>
  )
}
