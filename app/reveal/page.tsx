import dynamic from 'next/dynamic'
const StoryReveal = dynamic(() => import('@/components/StoryReveal'), { ssr: false })
const SaveStoryToProject = dynamic(() => import('@/components/SaveStoryToProject'), { ssr: false })

export default function RevealPage(){
	return (
		<div className="mx-auto max-w-3xl p-6">
			<StoryReveal />
			<SaveStoryToProject />
		</div>
	)
}
