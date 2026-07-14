import { Component, type ReactNode } from 'react'
import { STR } from '../i18n'

interface State {
  failed: boolean
}

/** Страховка: краш любого компонента не должен класть весь сайт.
 *  Живёт вне LangProvider, поэтому язык читает напрямую. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('Необработанная ошибка рендера:', error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    const s = STR[localStorage.getItem('lang') === 'en' ? 'en' : 'ru']
    return (
      <div className="crash">
        <div className="crash__panel toon-panel">
          <h1 className="crash__title">
            {s.crashTitle}
            <span className="accent">.</span>
          </h1>
          <p className="crash__text">{s.crashText}</p>
          <button className="crash__reload interactive" onClick={() => window.location.reload()}>
            {s.reload}
          </button>
        </div>
      </div>
    )
  }
}
