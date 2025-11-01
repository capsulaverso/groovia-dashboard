import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'md', className = '' }) => {
    const baseClasses = 'rounded-full font-medium';
    
    const variantClasses = {
        default: 'bg-[#00FFB2] bg-opacity-10 text-[#00FFB2]',
        success: 'bg-[#00FFB2] bg-opacity-10 text-[#00FFB2]',
        warning: 'bg-[#FFB200] bg-opacity-10 text-[#FFB200]',
        danger: 'bg-[#FF4D4D] bg-opacity-10 text-[#FF4D4D]',
        info: 'bg-[#00FFB2] bg-opacity-10 text-[#00FFB2]',
        neutral: 'bg-[#B0B0B0] bg-opacity-10 text-[#B0B0B0]'
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base'
    };

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
        <span className={combinedClasses}>
            {children}
        </span>
    );
};

export default Badge;

