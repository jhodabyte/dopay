import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  options: SelectOption[]
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void
  error?: string
  placeholder?: string
  disabled?: boolean
  name?: string
}

export default function Select({
  label,
  options,
  value,
  onChange,
  error,
  placeholder,
  disabled,
  name,
}: SelectProps) {
  return (
    <div className="flex flex-col">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium mb-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          'h-10 px-3 border rounded-lg text-sm transition-colors outline-none bg-white',
          'focus:border-[#0062FF]',
          error ? 'border-[#EF4444]' : 'border-[#E5E7EB]',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50'
        )}
        style={{ color: 'var(--color-text)' }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs mt-1" style={{ color: '#EF4444' }}>
          {error}
        </p>
      )}
    </div>
  )
}
