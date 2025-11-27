import { motion } from "framer-motion";
import React from "react";

const Button = React.forwardRef(({ 
  children, 
  className = "", 
  variant = "primary", 
  size = "default", 
  disabled = false, 
  isLoading = false,
  type = "button",
  ...props 
}, ref) => {
  
  const baseClasses = "inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl";
  
  const variants = {
    primary: "bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-700)] hover:from-[var(--color-primary-500)] hover:to-[var(--color-primary-600)] text-white shadow-lg hover:shadow-xl focus:ring-[var(--color-primary-200)]",
    secondary: "bg-white text-[var(--color-primary-700)] border-2 border-[var(--color-primary-100)] hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)] focus:ring-[var(--color-primary-100)]",
    outline: "bg-transparent border-2 border-white/20 text-white hover:bg-white/10 focus:ring-white/20",
    ghost: "bg-transparent text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] focus:ring-[var(--color-primary-100)]",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-200"
  };

  const sizes = {
    default: "px-6 py-3 text-base",
    sm: "px-4 py-2 text-sm",
    lg: "px-8 py-4 text-lg",
    icon: "p-3"
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      whileHover={!disabled && !isLoading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : children}
    </motion.button>
  );
});

Button.displayName = "Button";

export default Button;
