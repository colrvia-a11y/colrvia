import React from 'react'
import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function GET(req: Request, { params }: { params: { id: string } }) {
	const { searchParams } = new URL(req.url)
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
	if (!url || !key) return new Response('Server env missing', { status: 500 })
	const admin = createClient(url, key, { auth: { persistSession: false } })
	const variant = searchParams.get('variant') // reserved for future use
	const { data, error } = await admin.from('stories').select('*').eq('id', params.id).single()
	if (error || !data) return new Response('Not found', { status: 404 })
	const palette = (data.palette || []).slice(0, 5)
	const title = data.title as string

	const swatches = palette.map((p: any, i: number) =>
		React.createElement(
			'div',
			{
				key: i,
				style: {
					width: 160,
					height: 240,
					borderRadius: 28,
						background: p.hex,
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'flex-end',
						padding: 20,
						fontSize: 20,
						color: '#111',
						boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
				},
			},
			[
				React.createElement(
					'div',
					{
						key: 'name',
						style: {
							fontWeight: 600,
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
						},
					},
					p.name
				),
				React.createElement(
					'div',
					{ key: 'code', style: { fontSize: 14, opacity: 0.7 } },
					p.code
				),
			]
		)
	)

	const element = React.createElement(
		'div',
		{
			style: {
				fontFamily: 'system-ui, -apple-system, sans-serif',
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				background: '#F7F5EF',
				padding: 64,
				justifyContent: 'space-between',
			},
		},
		[
			React.createElement(
				'div',
				{ key: 'title', style: { fontSize: 48, fontWeight: 600, lineHeight: 1.05, maxWidth: 900 } },
				title
			),
			React.createElement(
				'div',
				{ key: 'palette', style: { display: 'flex', gap: 24 } },
				swatches
			),
			React.createElement(
				'div',
				{
					key: 'footer',
					style: {
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						fontSize: 20,
					},
				},
				[
					React.createElement(
						'div',
						{ key: 'bars', style: { display: 'flex', gap: 8, width: 300, height: 14 } },
						[
							React.createElement('div', { key: 'b1', style: { flex: 3, background: '#2F5D50', borderRadius: 8 } }),
							React.createElement('div', { key: 'b2', style: { flex: 1.5, background: '#4A7F71', borderRadius: 8 } }),
							React.createElement('div', { key: 'b3', style: { flex: 0.5, background: '#83B5A5', borderRadius: 8 } }),
						]
					),
					React.createElement(
						'div',
						{ key: 'brand', style: { fontSize: 24, fontWeight: 600, letterSpacing: 2 } },
						'COLRVIA'
					),
				]
			),
		]
	)

	return new ImageResponse(element, { width: 1200, height: 630 })
}

