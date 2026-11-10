import { Component, type ReactNode } from 'react'
import { ViewerFallback } from './ViewerFallback'

export class ViewerBoundary extends Component<{ children: ReactNode; onUnavailable: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onUnavailable() }
  render() { return this.state.failed ? <ViewerFallback /> : this.props.children }
}
