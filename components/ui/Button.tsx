import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    fullWidth?: boolean;
    icon?: string;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    fullWidth = false,
    icon,
    className = '',
    type = 'button'
}) => {
    const baseClasses = 'font-medium rounded-lg transition-all flex items-center justify-center gap-2';
    
    const variantClasses = {
        primary: 'bg-[#00FFB2] text-black hover:bg-[#00E6A0] hover:shadow-[0_0_20px_rgba(0,255,178,0.3)]',
        secondary: 'bg-[#00FFB2] bg-opacity-20 text-[#00FFB2] border border-[#00FFB2] hover:bg-[#00FFB2] hover:text-black hover:shadow-[0_0_15px_rgba(0,255,178,0.3)]',
        danger: 'bg-[#FF4D4D] text-white hover:bg-red-600 hover:shadow-[0_0_15px_rgba(255,77,77,0.3)]',
        success: 'bg-[#00FFB2] text-black hover:bg-[#00E6A0]',
        ghost: 'bg-transparent text-white hover:bg-[#1E1E1E] border border-[#2A2A2A]'
    };

    const sizeClasses = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={combinedClasses}
            style={{ fontFamily: 'Poppins, sans-serif' }}
        >
            {icon && <span className="material-icons-outlined text-lg">{icon}</span>}
            {children}
        </button>
    );
};

export default Button;

