import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseClass = "px-6 py-2 rounded-md transition-colors font-medium";
    
    let variantClass = "";
    if (variant === 'primary') {
        variantClass = "bg-deep-cocoa text-white hover:bg-opacity-90";
    } else if (variant === 'secondary') {
        variantClass = "bg-soft-peach text-deep-cocoa hover:bg-opacity-90";
    } else if (variant === 'outline') {
        variantClass = "border-2 border-deep-cocoa text-deep-cocoa hover:bg-stone-100";
    } else if (variant === 'danger') {
        variantClass = "bg-red-600 text-white hover:bg-red-700";
    }

    return (
        <button className={`${baseClass} ${variantClass} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
