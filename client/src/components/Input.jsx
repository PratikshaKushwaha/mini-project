import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, id, error, className = '', ...props }, ref) => {
    return (
        <div className={`flex flex-col mb-4 ${className}`}>
            {label && (
                <label htmlFor={id} className="mb-1 text-sm font-medium text-deep-cocoa">
                    {label}
                </label>
            )}
            <input
                id={id}
                ref={ref}
                className={`px-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-muted-taupe transition-shadow ${
                    error ? 'border-red-500' : 'border-stone-300'
                }`}
                {...props}
            />
            {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
