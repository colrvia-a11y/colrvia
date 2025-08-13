"use client";
import React from 'react'

export interface TemplateDef {
	id: string
	label: string
	values: Record<string, any>
}

export function TemplateChips({ templates, onApply }: { templates: TemplateDef[]; onApply: (v: Record<string,any>) => void }) {
	if(!templates?.length) return null
	return (
		<div className="flex flex-wrap gap-2" aria-label="Starter templates">
			{templates.map(t => (
				<button
					key={t.id}
					type="button"
					onClick={() => onApply(t.values)}
					className="px-3 py-1.5 rounded-full border text-xs font-medium bg-white/70 dark:bg-neutral-900/70 hover:bg-white focus-visible:ring-2 focus-visible:outline-none"
					aria-label={`Apply ${t.label} template`}
				>{t.label}</button>
			))}
		</div>
	)
}

export default TemplateChips
