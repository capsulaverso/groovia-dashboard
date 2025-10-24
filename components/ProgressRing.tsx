
import React from 'react';

interface ProgressRingProps {
    progress: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ progress }) => {
    const radius = 15.9155;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
                className="text-gray-300 dark:text-gray-600"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
            ></path>
            <path
                className="text-green-400 progress-ring__circle"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                strokeWidth="3"
            ></path>
        </svg>
    );
};

export default ProgressRing;
