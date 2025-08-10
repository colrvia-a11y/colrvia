import { describe, it, expect } from 'vitest'
import nextConfig from '../next.config'

describe('redirects', () => {
  it('includes legacy project redirects', async () => {
    const redirects = await (nextConfig as any).redirects()
    const projects = redirects.find((r:any)=>r.source==='/projects')
    const project = redirects.find((r:any)=>r.source==='/project/:path*')
    expect(projects).toBeTruthy()
    expect(projects.destination).toBe('/dashboard')
    expect(project.destination).toBe('/dashboard')
  })
})
