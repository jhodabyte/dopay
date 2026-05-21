import { cn } from '@/lib/utils'

interface InputProps {
  label?: string
  placeholder?: string
  type?: string
  error?: string
  hint?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  name?: string
  required?: boolean
  disabled?: boolean
}

export default function Input({
  label,
  placeholder,
  type = 'text',
  error,
  hint,
  value,
  onChange,
  name,
  required,
  disabled,
}: InputProps) {
  return (
    <div className="flex flex-col">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium mb-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={cn(
          'h-10 px-3 border rounded-lg text-sm transition-colors outline-none',
          'focus:border-[#0062FF]',
          error ? 'border-[#EF4444]' : 'border-[#E5E7EB]',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50'
        )}
        style={{ color: 'var(--color-text)' }}
      />
      {error && (
        <p className="text-xs mt-1" style={{ color: '#EF4444' }}>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {hint}
        </p>
      )}
    </div>
  )
}
