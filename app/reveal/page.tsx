import dynamic from 'next/dynamic'
const StoryReveal = dynamic(() => import('@/components/StoryReveal'), { ssr: false })

export default function RevealPage(){
	return (
		<div className="mx-auto max-w-3xl p-6">
			<StoryReveal />
		</div>
	)
}
