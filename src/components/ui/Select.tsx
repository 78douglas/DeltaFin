import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  variant?: 'default' | 'filled' | 'outlined';
  fullWidth?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className = '', 
    label,
    error,
    helperText,
    options,
    placeholder,
    variant = 'default',
    fullWidth = true,
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = 'appearance-none transition-all duration-200 focus:outline-none cursor-pointer';
    
    const variantClasses = {
      default: `border border-gray-300 rounded-lg px-4 py-3 pr-12 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        error ? 'border-red-500 focus:ring-red-500' : ''
      }`,
      filled: `bg-gray-100 border-0 rounded-lg px-4 py-3 pr-12 focus:bg-white focus:ring-2 focus:ring-blue-500 ${
        error ? 'bg-red-50 focus:ring-red-500' : ''
      }`,
      outlined: `border-2 border-gray-300 rounded-lg px-4 py-3 pr-12 bg-transparent focus:border-blue-500 ${
        error ? 'border-red-500 focus:border-red-500' : ''
      }`
    };
    
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '';
    const widthClass = fullWidth ? 'w-full' : '';
    
    const selectClasses = `${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${widthClass} ${className}`;
    
    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className={`block text-sm font-medium mb-2 ${
            error ? 'text-red-700' : 'text-gray-700'
          }`}>
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            className={selectClasses}
            disabled={disabled}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option, index) => (
              <option
                key={`${option.value}-${index}`}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDown size={20} className="text-gray-400" />
          </div>
        </div>
        
        {(error || helperText) && (
          <div className="mt-2 flex items-start space-x-1">
            {error && <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />}
            <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-600'}`}>
              {error || helperText}
            </p>
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
export type { SelectOption };