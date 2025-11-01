import React from 'react';

interface InputProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'textarea';
    disabled?: boolean;
    required?: boolean;
    error?: string;
    rows?: number;
    className?: string;
}

const Input: React.FC<InputProps> = ({
    label,
    placeholder,
    value,
    onChange,
    type = 'text',
    disabled = false,
    required = false,
    error,
    rows = 1,
    className = ''
}) => {
    const baseInputClasses = 'w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white text-sm lg:text-base focus:outline-none focus:border-[#00FFB2] focus:shadow-[0_0_0_1px_rgba(0,255,178,0.2)] transition-all disabled:text-[#B0B0B0] disabled:cursor-not-allowed';
    
    const errorClasses = error ? 'border-[#FF4D4D] focus:border-[#FF4D4D]' : '';
    const combinedInputClasses = `${baseInputClasses} ${errorClasses} ${className}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm text-[#B0B0B0] mb-2">
                    {label}
                    {required && <span className="text-[#FF4D4D] ml-1">*</span>}
                </label>
            )}
            {type === 'textarea' ? (
                <textarea
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    rows={rows}
                    className={`${combinedInputClasses} resize-none`}
                    style={{ minHeight: `${rows * 1.5}rem` }}
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={combinedInputClasses}
                />
            )}
            {error && (
                <p className="text-xs text-[#FF4D4D] mt-1">{error}</p>
            )}
        </div>
    );
};

export default Input;

