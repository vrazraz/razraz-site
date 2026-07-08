import { useEffect, useRef, useState } from 'react'

const NDA_PASSWORD = '1234'

export function PasswordGate({ title, onSuccess, onClose }: { title: string; onSuccess: () => void; onClose: () => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = () => {
    if (value === NDA_PASSWORD) {
      onSuccess()
    } else {
      setError(true)
      setValue('')
      inputRef.current?.focus()
    }
  }

  return (
    <>
      <div className="post-backdrop" onClick={onClose} />
      <div className={'pass-gate toon-panel' + (error ? ' pass-gate--error' : '')} role="dialog" aria-label="Кейс под NDA">
        <h3 className="pass-gate__title">
          Кейс под NDA<span className="accent">.</span>
        </h3>
        <p className="pass-gate__text">«{title}» защищён паролем — запросите его у Виталия.</p>
        <form
          className="pass-gate__row"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <input
            ref={inputRef}
            className="pass-gate__input"
            type="password"
            inputMode="numeric"
            placeholder="Пароль"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError(false)
            }}
            aria-label="Пароль"
          />
          <button type="submit" className="pass-gate__submit interactive">
            Открыть
          </button>
        </form>
        {error && <p className="pass-gate__error">Неверный пароль</p>}
      </div>
    </>
  )
}
