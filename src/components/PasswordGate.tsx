import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'

const NDA_PASSWORD = '1234'

export function PasswordGate({
  title,
  onSuccess,
  onClose,
  onTripleFail,
}: {
  title: string
  onSuccess: () => void
  onClose: () => void
  onTripleFail?: () => void
}) {
  const { s } = useI18n()
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const fails = useRef(0)
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
      fails.current += 1
      if (fails.current % 3 === 0) onTripleFail?.()
    }
  }

  return (
    <>
      <div className="post-backdrop" onClick={onClose} />
      <div
        className={'pass-gate toon-panel' + (error ? ' pass-gate--error' : '')}
        role="dialog"
        aria-label={s.ndaTitle}
      >
        <h3 className="pass-gate__title">
          {s.ndaTitle}
        </h3>
        <p className="pass-gate__text">{s.ndaText(title)}</p>
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
            placeholder={s.password}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError(false)
            }}
            aria-label={s.password}
          />
          <button type="submit" className="pass-gate__submit interactive">
            {s.open}
          </button>
        </form>
        {error && <p className="pass-gate__error">{s.wrongPassword}</p>}
      </div>
    </>
  )
}
