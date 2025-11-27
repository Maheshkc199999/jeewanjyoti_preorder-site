import React from "react";

const Input = React.forwardRef(({
    label,
    error,
    icon: Icon,
    className = "",
    containerClassName = "",
    type = "text",
    ...props
}, ref) => {
    return (
        <div className={`space-y-2 ${containerClassName}`}>
            {label && (
                <label className="block text-sm font-semibold text-gray-700 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <Icon className="h-5 w-5" />
                    </div>
                )}
                <input
                    ref={ref}
                    type={type}
                    className={`
            w-full px-4 py-3 rounded-xl border bg-gray-50/50
            transition-all duration-200
            focus:bg-white focus:ring-4 focus:ring-[var(--color-primary-100)] focus:border-[var(--color-primary-400)]
            disabled:bg-gray-100 disabled:cursor-not-allowed
            placeholder:text-gray-400
            ${Icon ? 'pl-11' : ''}
            ${error
                            ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
                            : 'border-gray-200 hover:border-gray-300'
                        }
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-sm text-red-500 ml-1 animate-pulse">
                    {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = "Input";

export default Input;
