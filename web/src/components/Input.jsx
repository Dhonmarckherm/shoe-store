import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-4 py-3 rounded-lg border bg-white text-secondary-900 
          placeholder-secondary-400 focus:outline-none focus:ring-2 
          focus:border-transparent transition-all duration-200
          dark:bg-secondary-800 dark:text-secondary-100 dark:placeholder-secondary-500
          ${error 
            ? 'border-red-500 focus:ring-red-500 dark:border-red-500' 
            : 'border-secondary-300 focus:ring-primary-500 dark:border-secondary-600'
          }
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
