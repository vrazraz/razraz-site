import { Component, type ReactNode } from 'react'

interface State {
  failed: boolean
}

/** Страховка: краш любого компонента не должен класть весь сайт */
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
    return (
      <div className="crash">
        <div className="crash__panel toon-panel">
          <h1 className="crash__title">
            Что-то сломалось<span className="accent">.</span>
          </h1>
          <p className="crash__text">Похоже, я перестарался с анимациями. Обновите страницу — обычно помогает.</p>
          <button className="crash__reload interactive" onClick={() => window.location.reload()}>
            Обновить
          </button>
        </div>
      </div>
    )
  }
}
