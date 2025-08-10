import Link from 'next/link'

/**
 * Landing page for Colrvia. Introduces the app and offers sign in and a
 * placeholder area for an illustration. Feel free to enhance this page
 * further with images and onboarding flow.
 */
export default function Home() {
  return (
    <main className="mx-auto max-w-md px-6 py-12 text-center">
      <div className="text-sm tracking-widest font-medium mb-6">COLRVIA</div>
      <div className="h-36 rounded-2xl border mb-4 grid place-items-center">
        <span>illustration placeholder</span>
      </div>
      <div className="flex items-center justify-center gap-1 mb-4">
        <div className="h-1 w-4 rounded-full bg-black" />
        <div className="h-1 w-1.5 rounded-full bg-neutral-300" />
        <div className="h-1 w-1.5 rounded-full bg-neutral-300" />
      </div>
      <h1 className="text-2xl font-semibold mb-2">Design your color story</h1>
      <p className="text-neutral-600 mb-6">
        Personalized paint palettes matched to your space, lighting, and
        style.
      </p>
      <button className="w-full rounded-2xl py-3 bg-black text-white mb-6">
        Get started
      </button>
  <div className="mt-8 text-sm">
        <Link href="/sign-in" className="rounded-xl px-4 py-2 border inline-block">Sign in</Link>
        <Link href="/dashboard" className="rounded-xl px-4 py-2 border inline-block ml-2">Go to dashboard</Link>
      </div>
    </main>
  )
}