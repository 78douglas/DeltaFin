import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className = '', 
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    variant = 'default',
    fullWidth = true,
    type = 'text',
    disabled,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    
    const baseClasses = 'transition-all duration-200 focus:outline-none';
    
    const variantClasses = {
      default: `border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        error ? 'border-red-500 focus:ring-red-500' : ''
      }`,
      filled: `bg-gray-100 border-0 rounded-lg px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 ${
        error ? 'bg-red-50 focus:ring-red-500' : ''
      }`,
      outlined: `border-2 border-gray-300 rounded-lg px-4 py-3 bg-transparent focus:border-blue-500 ${
        error ? 'border-red-500 focus:border-red-500' : ''
      }`
    };
    
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '';
    const widthClass = fullWidth ? 'w-full' : '';
    
    const inputClasses = `${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${widthClass} ${
      leftIcon ? 'pl-12' : ''
    } ${rightIcon || isPassword ? 'pr-12' : ''} ${className}`;
    
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
          {leftIcon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            className={inputClasses}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          
          {(rightIcon || isPassword) && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
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

Input.displayName = 'Input';

export default Input;