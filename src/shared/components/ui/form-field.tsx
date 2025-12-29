import * as React from 'react'
import { Label } from './label'
import { Input } from './input'
import { cn } from '@/shared/lib/utils'

interface FormFieldProps extends React.ComponentProps<'input'> {
  label?: string
  error?: string
  inputClassName?: string
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, className, inputClassName, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId

    return (
      <div className={cn('space-y-1.5', className)}>
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <div className="space-y-1">
          <Input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={inputClassName}
            {...props}
          />
          <p
            id={`${inputId}-error`}
            className={cn(
              'min-h-[1.25rem] text-xs text-destructive',
              !error && 'invisible'
            )}
          >
            {error || '\u00A0'}
          </p>
        </div>
      </div>
    )
  }
)

FormField.displayName = 'FormField'

export { FormField }
