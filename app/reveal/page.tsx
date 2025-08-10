import dynamic from 'next/dynamic'
const StoryReveal = dynamic(() => import('@/components/StoryReveal'), { ssr: false })
export default function RevealPage(){ return <StoryReveal/> }
