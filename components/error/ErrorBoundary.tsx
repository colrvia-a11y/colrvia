'use client'
import React from 'react'
type Props = { children: React.ReactNode }
type State = { hasError: boolean; id?: string }
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true, id: `${Date.now()}` } }
  render(){ return this.state.hasError ? (
    <div className="p-6 text-center">
      <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
      <p className="text-sm text-[var(--ink-subtle)]">Error id: {this.state.id}</p>
      <button type="button" className="mt-4 px-3 py-2 border rounded" onClick={()=>location.reload()}>Reload</button>
    </div>
  ) : this.props.children }
}
