import React, { forwardRef } from 'react';
import './Input.scss';

interface BaseInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  textarea?: boolean;
  select?: boolean;
  options?: Array<{ value: string | number; label: string }>;
  rows?: number;
}

export type InputProps = BaseInputProps & 
  React.InputHTMLAttributes<HTMLInputElement> & 
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & 
  React.SelectHTMLAttributes<HTMLSelectElement>;

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      textarea = false,
      select = false,
      options = [],
      rows = 3,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();

    // Dynamically compile component-scoped classes
    const stateClass = error ? 'input-field-error' : 'input-field-normal';
    const typeClass = select ? 'input-field-select' : textarea ? 'input-field-textarea' : '';
    const fieldClasses = `input-field ${stateClass} ${typeClass} ${className}`;

    return (
      <div className="input-wrapper">
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}

        {/* Input Field Body */}
        <div className="input-container">
          {select ? (
            <select
              id={inputId}
              ref={ref as React.Ref<HTMLSelectElement>}
              className={fieldClasses}
              {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : textarea ? (
            <textarea
              id={inputId}
              ref={ref as React.Ref<HTMLTextAreaElement>}
              rows={rows}
              className={fieldClasses}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              id={inputId}
              ref={ref as React.Ref<HTMLInputElement>}
              className={fieldClasses}
              {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          )}

          {/* Select Arrow Indicator */}
          {select && (
            <div className="input-arrow-container">
              <svg className="input-arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </div>

        {/* Error or Helper Display */}
        {error ? (
          <p className="input-error-msg">
            <svg className="input-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="input-helper-msg">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
