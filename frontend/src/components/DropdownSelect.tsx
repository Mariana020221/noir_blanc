import { useEffect, useMemo, useRef, useState } from 'react'

export interface DropdownOption {
  colorHex?: string
  label: string
  value: string
}

interface DropdownSelectProps {
  ariaLabel: string
  buttonLabel?: string
  className?: string
  disabled?: boolean
  onChange: (value: string) => void
  options: DropdownOption[]
  placeholder?: string
  showMenuIcon?: boolean
  showSelectedText?: boolean
  size?: 'field' | 'header'
  value: string
  withColorDot?: boolean
}

export const DropdownSelect = ({
  ariaLabel,
  buttonLabel,
  className,
  disabled = false,
  onChange,
  options,
  placeholder = 'Selecciona una opcion',
  showMenuIcon = false,
  showSelectedText = true,
  size = 'field',
  value,
  withColorDot = false,
}: DropdownSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  )

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const displayValue = selectedOption?.label ?? placeholder
  const hasSelection = value.trim().length > 0

  return (
    <div
      className={`dropdown-select dropdown-select--${size}${
        hasSelection ? ' is-selected' : ''
      }${isOpen ? ' is-open' : ''}${className ? ` ${className}` : ''}`}
      ref={rootRef}
    >
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className="dropdown-select__trigger"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="dropdown-select__content">
          {showMenuIcon ? (
            <span aria-hidden="true" className="dropdown-select__menu-icon">
              <span />
              <span />
              <span />
            </span>
          ) : null}

          <span className="dropdown-select__copy">
            {buttonLabel ? (
              <span className="dropdown-select__label">{buttonLabel}</span>
            ) : null}

            {showSelectedText || !buttonLabel ? (
              <span
                className={`dropdown-select__value${
                  !hasSelection ? ' is-placeholder' : ''
                }`}
              >
                {withColorDot && selectedOption?.colorHex ? (
                  <span
                    aria-hidden="true"
                    className="dropdown-select__color-dot"
                    style={{ backgroundColor: selectedOption.colorHex }}
                  />
                ) : null}
                <span>{displayValue}</span>
              </span>
            ) : null}
          </span>
        </span>

        <span aria-hidden="true" className="dropdown-select__arrow" />
      </button>

      {isOpen && !disabled ? (
        <div
          aria-label={ariaLabel}
          className="dropdown-select__menu"
          role="listbox"
        >
          {options.map((option) => {
            const isSelected = option.value === value

            return (
              <button
                aria-selected={isSelected}
                className={`dropdown-select__option${
                  isSelected ? ' is-selected' : ''
                }`}
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                role="option"
                type="button"
              >
                {withColorDot ? (
                  <span
                    aria-hidden="true"
                    className="dropdown-select__color-dot"
                    style={{ backgroundColor: option.colorHex ?? '#d2c8bc' }}
                  />
                ) : null}
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
