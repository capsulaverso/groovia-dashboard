import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'hover' | 'clickable' | 'accent';
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', variant = 'default', onClick }) => {
    const baseClasses = 'bg-[#1E1E1E] rounded-lg p-6 transition-all';
    
    const variantClasses = {
        default: '',
        hover: 'hover:border-[#00FFB2] cursor-pointer',
        clickable: 'hover:border-[#00FFB2] cursor-pointer hover:bg-[#1A1A1A]',
        accent: 'border border-[#00FFB2] bg-[#1E1E1E]'
    };

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

    if (onClick || variant === 'clickable' || variant === 'hover') {
        return (
            <div onClick={onClick} className={combinedClasses}>
                {children}
            </div>
        );
    }

    return (
        <div className={combinedClasses}>
            {children}
        </div>
    );
};

export default Card;

