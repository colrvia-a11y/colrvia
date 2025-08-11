export const dynamic = 'force-dynamic';
export const revalidate = 0;
import ndynamic from 'next/dynamic'
const StoryReveal = ndynamic(() => import('@/components/StoryReveal'), { ssr: false })

export default function RevealPage(){
	return (
		<div className="mx-auto max-w-3xl p-6">
			<StoryReveal />
		</div>
	)
}
